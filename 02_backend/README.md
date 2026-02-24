# Share Note API - Backend

A secure, self-destructing notes API built with FastAPI and Google Cloud Firestore. This service allows users to create notes that automatically expire after a specified time period.

## Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) 0.129.0+
- **Database**: Google Cloud Firestore
- **Validation**: Pydantic 2.12.5+
- **Python**: 3.14+
- **Package Manager**: [uv](https://github.com/astral-sh/uv)

## API Endpoints

### Create Note

```http
POST /note
X-API-Key: <your-api-key>
Content-Type: application/json

{
  "content": "Your secret message",
  "ttl_seconds": 1800
}
```

**Response:**

```json
{
  "id": "uuid-v4",
  "expires_at": "2024-01-01T00:00:00Z"
}
```

### Retrieve Note

```http
GET /note/{note_id}
X-API-Key: <your-api-key>
```

**Response:**

```json
{
  "content": "Your secret message"
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid API key
- `404 Not Found`: Note does not exist or has expired

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_API_KEY` | API key for authentication | `D3VM0DE` |
| `FRONTEND_ADDRESS` | Allowed CORS origin | `http://localhost:4200` |
| `FIRESTORE_DB` | Firestore database name | `share-note-gcp` |
| `FIRESTORE_DB_COLLECTION` | Firestore collection name | `dev-notes` |
| `GCP_PROJECT_ID` | Google Cloud project ID | `dev-share-note-gcp` |
| `LOG_LEVEL` | Logging level | `WARNING` |

## Local Development

### Docker Compose

#### Prerequisites

1. **Docker** and **Docker Compose** installed
2. **Google Cloud SDK** installed and configured
3. **Application Default Credentials** configured:

   ```bash
   gcloud auth application-default login
   ```

   Or with service account impersonation (command available as an output of Tofu IaC):

   ```bash
   gcloud auth application-default login --impersonate-service-account={{SA_NAME}}@{{PROJECT_NAME}}.iam.gserviceaccount.com
   ```

#### Running with Docker Compose

1. **Navigate to the backend directory**:

   ```bash
   cd 02_backend
   ```

2. **Start the service**:

   ```bash
   docker-compose -f docker-compose.dev.yaml up
   ```

   Or run in detached mode (background):

   ```bash
   docker-compose -f docker-compose.dev.yaml up -d
   ```

3. **Access the API**:
   - API Base URL: `http://localhost:8000`
   - Swagger UI: `http://localhost:8000/docs`

#### Docker Compose Commands

```bash
# View logs
docker-compose -f docker-compose.dev.yaml logs -f

# Stop the service
docker-compose -f docker-compose.dev.yaml down

# Rebuild after code changes
docker-compose -f docker-compose.dev.yaml up --build

# Execute commands in the container
docker-compose -f docker-compose.dev.yaml exec backend sh
```

#### Environment Variables

The `docker-compose.dev.yaml` file includes all required environment variables with development defaults.

### Local Development with UV and FastAPI

#### Prerequisites

1. **Python 3.14+** installed
2. **uv package manager** installed:

   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

3. **Google Cloud SDK** installed and configured
4. **Application Default Credentials** configured (see Docker Compose prerequisites above)

#### Setup

1. **Navigate to the backend directory**:

   ```bash
   cd 02_backend
   ```

2. **Install dependencies**:

   ```bash
   uv sync
   ```

3. **Set environment variables** (optional):

   ```bash
   export GCP_PROJECT_ID="your-project-id"
   export APP_API_KEY="your-secret-api-key"
   export FRONTEND_ADDRESS="http://localhost:4200"
   export FIRESTORE_DB="share-note-gcp"
   export FIRESTORE_DB_COLLECTION="dev-notes"
   export LOG_LEVEL="DEBUG"
   ```

4. **Run the development server**:

   ```bash
   uv run fastapi dev main.py --port 8000
   ```

5. **Access the API**:
   - API Base URL: `http://localhost:8000`
   - Swagger UI: `http://localhost:8000/docs`

## Project Structure

```
02_backend/
├── app/                       # Application directory (currently empty)
├── main.py                    # FastAPI application and endpoints
├── models.py                  # Pydantic models for request/response validation
├── constants.py               # Application constants
├── envs.py                    # Environment variable configuration
├── Dockerfile                 # Docker container configuration
├── docker-compose.dev.yaml    # Docker Compose configuration for development
├── pyproject.toml             # Project dependencies and metadata
├── uv.lock                    # Locked dependency versions
└── README.md                  # This file
```

## Security Considerations

### API Key Authentication

- All endpoints require a valid API key in the `X-API-Key` header
- Store API keys securely and rotate them regularly
- In production, use environment variables or secret management services (e.g., GCP Secret Manager)

### CORS Configuration

- CORS is configured to allow only specified frontend origins
- Update `FRONTEND_ADDRESS` for production deployments
- Currently allows credentials and restricts methods to POST and GET

### Data Security

- Notes are encrypted by frontend, and being stored in Firestore with automatic expiration

## Firestore Configuration

### TTL Policy

Notes automatically expire based on the `expires_at` field which can be set trough dedicated variable of Tofu deployment in root directory of this repository.

### Indexes

No additional indexes are required for basic operations. The application uses simple document lookups by ID.

## Deployment

Check root folder and Github Actions pipelines for more information.
