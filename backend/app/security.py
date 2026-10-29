import base64
import hashlib
import hmac
import json
import os
import secrets
import time

JWT_SECRET = os.getenv("JWT_SECRET") or secrets.token_urlsafe(48)
TOKEN_TTL_SECONDS = 60 * 60 * 24


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
    return f"{_b64(salt)}.{_b64(digest)}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        salt_text, digest_text = encoded.split(".", 1)
        expected = _unb64(digest_text)
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), _unb64(salt_text), 310_000)
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def create_token(user_id: int) -> str:
    now = int(time.time())
    header = _b64(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    payload = _b64(
        json.dumps(
            {"sub": str(user_id), "iat": now, "exp": now + TOKEN_TTL_SECONDS},
            separators=(",", ":"),
        ).encode()
    )
    signing_input = f"{header}.{payload}".encode()
    signature = hmac.new(JWT_SECRET.encode(), signing_input, hashlib.sha256).digest()
    return f"{header}.{payload}.{_b64(signature)}"


def decode_token(token: str) -> int:
    header, payload, signature = token.split(".")
    signing_input = f"{header}.{payload}".encode()
    expected = hmac.new(JWT_SECRET.encode(), signing_input, hashlib.sha256).digest()
    if not hmac.compare_digest(expected, _unb64(signature)):
        raise ValueError("Invalid token signature.")
    header_claims = json.loads(_unb64(header))
    claims = json.loads(_unb64(payload))
    if not isinstance(header_claims, dict) or header_claims.get("alg") != "HS256":
        raise ValueError("Unsupported token algorithm.")
    if not isinstance(claims, dict):
        raise ValueError("Invalid token claims.")
    expires_at = claims.get("exp")
    if not isinstance(expires_at, int) or expires_at <= int(time.time()):
        raise ValueError("Token has expired.")
    user_id = int(claims["sub"])
    if user_id < 1:
        raise ValueError("Invalid token subject.")
    return user_id


def _b64(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode()


def _unb64(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))
