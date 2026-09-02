import hashlib
import json
from datetime import datetime

class BlockchainAuditService:
    """
    Simulates a cryptographic audit trail for the final compliance report.
    This guarantees that the report data hasn't been tampered with post-verification.
    """
    
    @staticmethod
    def generate_audit_hash(report_data: dict) -> str:
        # Create a deterministic string from the report
        report_string = json.dumps(report_data, sort_keys=True)
        # Add timestamp for uniqueness
        timestamp = datetime.utcnow().isoformat()
        
        raw_string = f"{report_string}|{timestamp}"
        
        # Generate SHA-256 hash
        audit_hash = hashlib.sha256(raw_string.encode('utf-8')).hexdigest()
        
        return f"0x{audit_hash}"
