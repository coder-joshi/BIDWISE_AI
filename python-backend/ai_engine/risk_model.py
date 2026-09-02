class RiskModel:
    """
    Calculates a risk score (0-100) based on compliance failures and fraud signals.
    """
    
    @staticmethod
    def calculate_risk(compliance_results: dict, fraud_signals: list) -> dict:
        base_risk = 0
        
        # Add risk for compliance failures
        fail_count = len(compliance_results.get("failed", []))
        base_risk += fail_count * 15
        
        # Add risk for fraud signals
        for signal in fraud_signals:
            if signal.get("severity") == "HIGH":
                base_risk += 40
            elif signal.get("severity") == "MEDIUM":
                base_risk += 20
                
        # Cap at 100
        final_risk = min(100, base_risk)
        
        # Determine tier
        if final_risk < 30:
            tier = "Low"
        elif final_risk < 70:
            tier = "Medium"
        else:
            tier = "High"
            
        return {
            "score": final_risk,
            "tier": tier,
            "explanation": f"Risk calculated based on {fail_count} compliance failures and {len(fraud_signals)} fraud signals."
        }
