from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.ml_core import FraudDetector, PricingModel, calculate_gig_score_update

app = FastAPI(title="GigShield AI Engine")

# Singleton instances for models
fraud_engine = FraudDetector()
pricing_engine = PricingModel()

class PremiumRequest(BaseModel):
    weather_score: float
    aqi_score: float
    zone_risk: float
    gig_score: int

class FraudRequest(BaseModel):
    user_id: str
    gps_valid: bool
    zone_changes_month: int
    claims_count_7d: int
    device_id_shared: bool
    gig_score: int

class ScoreRequest(BaseModel):
    current_score: int
    events: List[str]

@app.post("/predict/premium")
async def predict_premium(req: PremiumRequest):
    features = [req.weather_score, req.aqi_score, req.zone_risk, float(req.gig_score) / 1000]
    adjustment = pricing_engine.predict_adjustment(features)
    return {"adjustment": adjustment}

@app.post("/detect/fraud")
async def detect_fraud(req: FraudRequest):
    risk_score = fraud_engine.detect_risk(req.dict())
    decision = "REJECT" if risk_score >= 80 else "APPROVE"
    if risk_score > 50 and risk_score < 80:
        decision = "REVIEW"
    
    return {
        "fraud_risk_score": risk_score,
        "decision": decision
    }

@app.post("/calculate/gigscore")
async def update_score(req: ScoreRequest):
    updated_score = calculate_gig_score_update(req.current_score, req.events)
    return {"updated_score": updated_score}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "ml-fraud-engine"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
