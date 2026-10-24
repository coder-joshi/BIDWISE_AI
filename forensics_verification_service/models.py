from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel


def now_iso() -> str:
    """UTC timestamp like 2026-10-24T10:34:09.643Z (replaces the deprecated datetime.utcnow())."""
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


class Evidence(BaseModel):
    value: str
    page: Optional[int] = None
    bbox: Optional[List[float]] = None  # [x, y, w, h] as fractions (0 to 1) of the page/image size


class ForensicsResponse(BaseModel):
    status: str
    source: str = "MOCK"
    is_mock: bool = True
    checked_at: str
    confidence: str
    explanation: str
    processing_ms: float = 0.0
    disclaimer: str = "Alert requiring committee verification, not a fraud finding."
    evidence: Optional[Evidence] = None