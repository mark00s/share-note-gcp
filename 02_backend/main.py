from datetime import datetime, timezone, timedelta
import hashlib
import uuid

from fastapi import Depends, FastAPI, HTTPException, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from google.cloud import firestore

from constants import APP_NAME, FIREBASE_TTL_FIELD
from envs import APP_API_KEY, FIRESTORE_DB_COLLECTION, FRONTEND_ADDRESS, GCP_PROJECT_ID
from models import CreateNote, GetNote


app = FastAPI(title=APP_NAME)
db = firestore.Client(project=GCP_PROJECT_ID)

# CORS, let me in
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ADDRESS],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["X-API-KEY"],
)

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)


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
    # Picked v4 for better security
    # Pick v7 for performance
    note_id = str(uuid.uuid4())
    password_hash = payload.password

    # If not empty, hash it one-way
    if password_hash:
        password_hash = hashlib.sha256(payload.password.encode()).hexdigest()

    expire_datetime = datetime.now(timezone.utc) + timedelta(
        seconds=payload.ttl_seconds
    )

    doc_ref = db.collection(FIRESTORE_DB_COLLECTION).document(note_id)
    doc_ref.set(
        {
            "content": payload.content,
            "password_hash": password_hash,
            FIREBASE_TTL_FIELD: expire_datetime,
        }
    )

    return {"id": id, "expires_at": expire_datetime}


@app.get("/note/{note_id}", dependencies=[Depends(verify_api_key)])
def read_note(note_id: str, payload: GetNote):
    doc_ref = db.collection(FIRESTORE_DB_COLLECTION).document(note_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note does not exist or has expired.",
        )

    data = doc.to_dict()

    provided_hash = hashlib.sha256(payload.password.encode()).hexdigest()
    if data.get("password_hash") != provided_hash:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Invalid note password"
        )

    return {"content": data.get("content")}
