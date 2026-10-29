from typing import Literal

from pydantic import BaseModel, Field, field_validator


def validate_email(value: str) -> str:
    email = value.strip().lower()
    if len(email) > 254 or "@" not in email or email.startswith("@") or email.endswith("@"):
        raise ValueError("Enter a valid email address.")
    local, domain = email.rsplit("@", 1)
    if not local or "." not in domain or any(char.isspace() for char in email):
        raise ValueError("Enter a valid email address.")
    return email


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str
    password: str = Field(min_length=8, max_length=256)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Name is required.")
        return cleaned

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        return validate_email(value)


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=1, max_length=256)

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        return validate_email(value)


class CodeRequest(BaseModel):
    code: str = Field(min_length=1, max_length=100_000)
    language: str = Field(default="javascript", max_length=40)


class DebugRequest(CodeRequest):
    errorTrace: str = Field(default="", max_length=30_000)


class GenerateRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=10_000)
    language: str = Field(default="python", max_length=40)
    framework: str = Field(default="none", max_length=80)


class TestsRequest(BaseModel):
    code: str = Field(min_length=1, max_length=100_000)
    kinds: list[str] = Field(default_factory=list, max_length=10)


class DocsRequest(CodeRequest):
    type: Literal["function", "api", "readme", "project"] = "function"


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4_000)
    projectId: str | None = None
