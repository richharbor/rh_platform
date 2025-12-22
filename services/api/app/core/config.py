import os
from typing import List

DEFAULT_CORS_ORIGINS = [
    "http://localhost:19006",
    "http://localhost:8081",
]


def get_cors_origins() -> List[str]:
    raw = os.getenv("CORS_ORIGINS")
    if not raw:
        return DEFAULT_CORS_ORIGINS

    value = raw.strip()
    if value == "*":
        return ["*"]

    return [origin.strip() for origin in value.split(",") if origin.strip()]
