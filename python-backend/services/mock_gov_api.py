import random
import time

class MockGovAPI:
    """
    Simulates external API calls to Indian Government databases.
    In production, these would be API Setu or direct departmental APIs.
    """
    
    @staticmethod
    def verify_gstin(gstin: str) -> dict:
        # Simulate network delay
        time.sleep(0.5)
        
        # Mock logic based on input
        if len(gstin) != 15:
            return {"status": "error", "message": "Invalid GSTIN format"}
            
        return {
            "status": "success",
            "data": {
                "gstin": gstin,
                "legal_name": "TATA MOTORS LIMITED",
                "status": "Active",
                "taxpayer_type": "Regular",
                "date_of_registration": "01/07/2017"
            }
        }
        
    @staticmethod
    def verify_udyam(udyam_no: str) -> dict:
        time.sleep(0.6)
        
        return {
            "status": "success",
            "data": {
                "udyam_registration_number": udyam_no,
                "enterprise_name": "TATA MOTORS LIMITED",
                "enterprise_type": "Large",
                "major_activity": "Manufacturing",
                "social_category": "General",
                "status": "Active"
            }
        }

    @staticmethod
    def verify_mca21(cin: str) -> dict:
        time.sleep(0.4)
        return {
            "status": "success",
            "data": {
                "cin": cin,
                "company_name": "TATA MOTORS LIMITED",
                "roc_code": "RoC-Mumbai",
                "registration_number": "045614",
                "company_category": "Company limited by Shares",
                "company_subcategory": "Non-govt company",
                "class_of_company": "Public",
                "status": "Active"
            }
        }
