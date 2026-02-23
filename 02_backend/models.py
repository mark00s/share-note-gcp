from pydantic import BaseModel

from constants import NOTE_TTL


# TODO: https://docs.pydantic.dev/2.0/usage/types/secrets/
class CreateNote(BaseModel):
    content: str
    ttl_seconds: int = NOTE_TTL
