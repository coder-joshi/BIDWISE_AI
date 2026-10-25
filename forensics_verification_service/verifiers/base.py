from abc import ABC, abstractmethod
from models import ForensicsResponse, now_iso

class BaseVerifier(ABC):
    """
    Abstract base class for all government and registry verifiers.
    Ensures seamless swapping between Mock data and Live APIs.
    """
    @abstractmethod
    def verify(self, identifier: str) -> ForensicsResponse:
        pass

class MockGSTVerifier(BaseVerifier):
    def verify(self, identifier: str) -> ForensicsResponse:
        if "NEXUS" in identifier.upper():
            status, explanation = "valid", "GSTIN Active. Taxpayer registered as Nexus Global."
        elif "SHIVALIK" in identifier.upper():
            status, explanation = "warning", "GSTIN Active. Flagged for recent principal place of business change."
        else: 
            status, explanation = "valid", "GSTIN Active. Regular Taxpayer verified."
            
        return ForensicsResponse(
            status=status,
            checked_at=now_iso(),
            confidence="high",
            explanation=explanation
        )

class MockUdyamVerifier(BaseVerifier):
    def verify(self, identifier: str) -> ForensicsResponse:
        if "NEXUS" in identifier.upper():
            return ForensicsResponse(
                status="invalid",
                checked_at=now_iso(),
                confidence="high",
                explanation="Udyam Registry mismatch: Registered as NIC 46510 (Trading). Trading companies are ineligible."
            )
        return ForensicsResponse(
            status="valid",
            checked_at=now_iso(),
            confidence="high",
            explanation="Udyam Registration verified as Manufacturing entity."
        )

class MockUDINVerifier(BaseVerifier):
    def verify(self, identifier: str) -> ForensicsResponse:
        return ForensicsResponse(
            status="valid",
            checked_at=now_iso(),
            confidence="high",
            explanation="UDIN mathematically verified and active on portal."
        )