from datetime import datetime, timezone, timedelta
import hashlib
import logging
import uuid

from fastapi import Depends, FastAPI, HTTPException, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from google.api_core import exceptions as gcp_exceptions
from google.cloud import firestore

from constants import APP_NAME, FIREBASE_TTL_FIELD, NOTE_TTL
from envs import (
    APP_API_KEY,
    FIRESTORE_DB,
    FIRESTORE_DB_COLLECTION,
    FRONTEND_ADDRESS,
    GCP_PROJECT_ID,
    LOG_LEVEL,
)
from models import CreateNote

if not hasattr(logging, LOG_LEVEL):
    logging.warning("LOG_LEVEL not set, defaulting to ERROR")
    logging.basicConfig(level=logging.ERROR)
else:
    logging.basicConfig(level=LOG_LEVEL)

app = FastAPI(title=APP_NAME)
db = firestore.Client(project=GCP_PROJECT_ID, database=FIRESTORE_DB)

# CORS, let me in
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ADDRESS],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["X-API-KEY"],
)

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)


# Global exception handler for all GCP exceptions
@app.exception_handler(gcp_exceptions.GoogleAPIError)
async def gcp_exception_handler(_request, exc: gcp_exceptions.GoogleAPIError):
    """Handle all GCP exceptions globally using pattern matching.

    This consolidated handler catches all Google Cloud Platform exceptions
    and converts them to appropriate HTTPExceptions with user-friendly messages.
    """
    match exc:
        case gcp_exceptions.PermissionDenied():
            logging.error("Permission denied when accessing Firestore: %s", str(exc))
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service is not properly configured. Please contact support.",
            ) from exc

        case gcp_exceptions.Unauthenticated():
            logging.error("Authentication failed for Firestore: %s", str(exc))
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database authentication failed. Please contact support.",
            ) from exc

        case gcp_exceptions.ServiceUnavailable():
            logging.error("Firestore service unavailable: %s", str(exc))
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service is temporarily unavailable. Please try again later.",
            ) from exc

        case gcp_exceptions.RetryError():
            logging.error("Firestore operation timed out: %s", str(exc))
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Database operation timed out. Please try again later.",
            ) from exc

        case _:
            # Catch-all for any other GCP exceptions
            logging.error("Google Cloud API error: %s", str(exc))
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    "An error occurred while communicating with the database. "
                    "Please try again later."
                ),
            ) from exc


def verify_api_key(api_key: str = Security(api_key_header)):
    """Verify the API key provided in the request header.

    This function validates the API key sent in the X-API-Key header against
    the configured application API key. It is used as a FastAPI dependency
    to protect endpoints from unauthorized access.

    Args:
        api_key (str): The API key extracted from the X-API-Key header.
            Automatically injected by FastAPI's Security dependency system.

    Returns:
        str: The validated API key if authentication is successful.

    Raises:
        HTTPException: 401 Unauthorized if the provided API key does not
            match the configured APP_API_KEY.

    Example:
        Use as a dependency in FastAPI route handlers:

        @app.get("/protected")
        def protected_route(api_key: str = Depends(verify_api_key)):
            return {"message": "Access granted"}
    """
    if api_key != APP_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key.",
        )
    return api_key


@app.post("/note", dependencies=[Depends(verify_api_key)])
def create_note(payload: CreateNote):
    if payload.ttl_seconds > NOTE_TTL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Note TTL",
        )

    # Picked v4 for better security
    # Pick v7 for performance
    note_id = str(uuid.uuid4())

    expire_datetime = datetime.now(timezone.utc) + timedelta(
        seconds=payload.ttl_seconds
    )

    logging.debug(
        "expired_datetime set to %s", expire_datetime.strftime("%d/%m/%Y, %H:%M:%S")
    )

    doc_ref = db.collection(FIRESTORE_DB_COLLECTION).document(note_id)

    logging.info("Document reference has been created")

    doc_ref.set(
        {
            "content": payload.content,
            FIREBASE_TTL_FIELD: expire_datetime,
        }
    )
    logging.info("Document has been saved successfully")

    return {"id": note_id, "expires_at": expire_datetime}


@app.get("/note/{note_id}", dependencies=[Depends(verify_api_key)])
def read_note(note_id: str):
    doc_ref = db.collection(FIRESTORE_DB_COLLECTION).document(note_id)
    logging.info("Document reference has been created")
    logging.debug("note_id: %s", note_id)

    doc = doc_ref.get()
    logging.info("Retrieved Document")

    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note does not exist or has expired.",
        )

    data = doc.to_dict()

    return {"content": data.get("content")}
