from pydantic import BaseModel
from typing import List, Optional

class Evidence(BaseModel):
    value: str
    page: int
    bbox: List[float]

class ForensicsResponse(BaseModel):
    status: str
    source: str = "MOCK"
    is_mock: bool = True
    checked_at: str
    confidence: str
    explanation: str
    disclaimer: str = "Alert requiring committee verification, not a fraud finding."
    evidence: Optional[Evidence] = None
