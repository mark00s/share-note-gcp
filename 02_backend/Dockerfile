FROM astral/uv:python3.14-alpine3.23

# TODO: Unsave - rework it to use GCP Secret Manager
ARG APP_API_KEY="D3VM0DE"
ARG FRONTEND_ADDRESS="http://localhost:4200"
ARG FIRESTORE_DB="share-note-gcp"
ARG FIRESTORE_DB_COLLECTION="dev-notes"
ARG GCP_PROJECT_ID="dev-share-note-gcp"
ARG LOG_LEVEL="WARNING"

# Copy the application into the container.
COPY . /app

# Install the application dependencies.
WORKDIR /app
RUN uv sync --locked --no-cache

# TODO: Unsave - rework it to use GCP Secret Manager
ENV APP_API_KEY=${APP_API_KEY}
ENV FRONTEND_ADDRESS=${FRONTEND_ADDRESS}
ENV FIRESTORE_DB=${FIRESTORE_DB}
ENV FIRESTORE_DB_COLLECTION=${FIRESTORE_DB_COLLECTION}
ENV GCP_PROJECT_ID=${GCP_PROJECT_ID}
ENV LOG_LEVEL=${LOG_LEVEL}

# Run the application.
CMD ["/app/.venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
