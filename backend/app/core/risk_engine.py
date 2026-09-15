def calculate_risk(probability: float) -> dict:
    """
    Converts ML probability (0 to 1) into a prototype risk score and class.
    
    IMPORTANT: These thresholds are prototype thresholds and must be clearly 
    documented as such. They are NOT scientifically validated warning thresholds.
    """
    risk_score = round(probability * 100, 1)
    
    if risk_score <= 34.9: # 0-34
        risk_class = "LOW"
    elif risk_score <= 54.9: # 35-54
        risk_class = "MODERATE"
    elif risk_score <= 74.9: # 55-74
        risk_class = "HIGH"
    else: # 75-100
        risk_class = "CRITICAL"
        
    return {
        "risk_score": risk_score,
        "risk_class": risk_class
    }
