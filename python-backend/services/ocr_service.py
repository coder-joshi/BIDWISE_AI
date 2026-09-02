import time

class OCRService:
    """
    Mock OCR Service representing GOT-OCR 2.0 / PaddleOCR extraction.
    """
    
    @staticmethod
    def extract_text(file_path: str) -> dict:
        # Simulate processing time for large PDF
        time.sleep(2)
        
        # In a real scenario, this would return structured JSON extracted via LLM LayoutLMv3
        return {
            "status": "success",
            "extracted_data": {
                "gstin": "27AAACT2727Q1Z7",
                "pan": "AAACT2727Q",
                "udyam": "UDYAM-MH-18-0012345",
                "turnover_fy23": "125000000",
                "experience_years": 8,
                "iso_certified": True
            },
            "confidence_score": 0.97
        }
