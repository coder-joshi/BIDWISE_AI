class ComplianceRuleEngine:
    """
    Evaluates extracted data against predefined GeM tender rules.
    """
    
    @staticmethod
    def evaluate(extracted_data: dict, tender_requirements: dict) -> dict:
        results = {
            "passed": [],
            "failed": [],
            "score": 100
        }
        
        # 1. Turnover check
        if int(extracted_data.get("turnover_fy23", 0)) >= tender_requirements.get("min_turnover", 0):
            results["passed"].append({"rule": "Minimum Turnover", "message": "Turnover meets requirement"})
        else:
            results["failed"].append({"rule": "Minimum Turnover", "message": "Turnover below required threshold"})
            results["score"] -= 30
            
        # 2. Experience check
        if extracted_data.get("experience_years", 0) >= tender_requirements.get("min_experience", 0):
            results["passed"].append({"rule": "Experience", "message": "Experience meets requirement"})
        else:
            results["failed"].append({"rule": "Experience", "message": "Insufficient experience years"})
            results["score"] -= 20
            
        # 3. ISO Certification
        if tender_requirements.get("iso_required") and not extracted_data.get("iso_certified"):
            results["failed"].append({"rule": "ISO Certification", "message": "Missing required ISO certification"})
            results["score"] -= 15
        else:
            results["passed"].append({"rule": "ISO Certification", "message": "ISO certification present"})
            
        return results
