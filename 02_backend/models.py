from pydantic import BaseModel

from constants import NOTE_TTL


# TODO: https://docs.pydantic.dev/2.0/usage/types/secrets/
class CreateNote(BaseModel):
    content: str
    password: str = ""  # No password by default
    ttl_seconds: int = NOTE_TTL


class GetNote(BaseModel):
    password: str
