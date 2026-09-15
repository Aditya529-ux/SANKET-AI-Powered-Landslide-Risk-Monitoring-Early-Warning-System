import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, create_model
from typing import List, Dict, Any, Optional
import pandas as pd
import os
import json

from app.ml.predict import predictor
from app.core.risk_engine import calculate_risk

router = APIRouter()

class BroadcastRequest(BaseModel):
    state: str
    latitude: float
    longitude: float
    risk_score: float
    risk_class: str
    message: str

class BroadcastResponse(BaseModel):
    status: str
    message: str
    broadcast_id: str
    timestamp: str


DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'data', 'SANKET_Geographically_Corrected_20000.csv'))

# Create dynamic Pydantic model for input validation based on trained model info
# But since we need the server to start even if model is broken, we fall back to generic dict if needed.
def get_prediction_schema():
    if predictor.is_loaded and predictor.model_info:
        fields = {}
        for num_col in predictor.model_info['numerical_features']:
            fields[num_col] = (float, ...)
        for cat_col in predictor.model_info['categorical_features']:
            fields[cat_col] = (str, ...)
        return create_model('PredictionInput', **fields)
    else:
        return create_model('PredictionInput', __base__=BaseModel)

PredictionInput = get_prediction_schema()

# Cache the dataset and hotspots for performance
_dataset_cache = None
_hotspots_cache = None
_summary_cache = None

def get_cached_dataset():
    global _dataset_cache
    if _dataset_cache is None:
        if not os.path.exists(DATA_PATH):
            raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")
        _dataset_cache = pd.read_csv(DATA_PATH)
    return _dataset_cache

def process_hotspots_and_summary():
    global _hotspots_cache, _summary_cache
    if _hotspots_cache is not None and _summary_cache is not None:
        return
        
    df = get_cached_dataset()
    
    if not predictor.is_loaded:
        raise RuntimeError("Model is not loaded, cannot calculate hotspots.")
        
    # Get batch predictions
    predictions, probabilities = predictor.predict_batch(df)
    
    hotspots = []
    
    counts = {"CRITICAL": 0, "HIGH": 0, "MODERATE": 0, "LOW": 0}
    landslide_events = int(df['landslide_occurrence'].sum()) if 'landslide_occurrence' in df.columns else 0
    states = df['state'].nunique() if 'state' in df.columns else 0
    
    # Pre-calculate to avoid huge JSON response, maybe limit or send all
    # Since it's 20,000 rows, returning all might be large. We will return all as requested, 
    # but we only include required fields.
    
    # For performance on large df, vectorized risk score calculation could be done, 
    # but let's stick to the requested logic.
    risk_scores = [calculate_risk(prob) for prob in probabilities]
    
    for i in range(len(df)):
        risk = risk_scores[i]
        counts[risk['risk_class']] += 1
        
        record = {
            "date": str(df.iloc[i].get("date", "")),
            "state": str(df.iloc[i].get("state", "")),
            "latitude": float(df.iloc[i].get("latitude", 0.0)),
            "longitude": float(df.iloc[i].get("longitude", 0.0)),
            "risk_score": risk["risk_score"],
            "risk_class": risk["risk_class"],
            "landslide_occurrence": float(df.iloc[i].get("landslide_occurrence", 0.0))
        }
        hotspots.append(record)
        
    _hotspots_cache = hotspots
    _summary_cache = {
        "total_records": len(df),
        "critical_zones": counts["CRITICAL"],
        "high_risk_zones": counts["HIGH"],
        "moderate_zones": counts["MODERATE"],
        "low_risk_zones": counts["LOW"],
        "landslide_events": landslide_events,
        "states_monitored": states
    }

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "SANKET API",
        "model_loaded": predictor.is_loaded
    }

@router.post("/predict")
def predict(input_data: PredictionInput):
    if not predictor.is_loaded:
        raise HTTPException(status_code=503, detail="Model pipeline is not loaded.")
        
    try:
        data_dict = input_data.dict()
        pred_result = predictor.predict(data_dict)
        
        risk_result = calculate_risk(pred_result["landslide_probability"])
        
        return {
            "prediction": pred_result["prediction"],
            "landslide_probability": pred_result["landslide_probability"],
            "risk_score": risk_result["risk_score"],
            "risk_class": risk_result["risk_class"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

@router.get("/hotspots")
def get_hotspots():
    try:
        process_hotspots_and_summary()
        return _hotspots_cache
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary")
def get_summary():
    try:
        process_hotspots_and_summary()
        return _summary_cache
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/alerts/broadcast', response_model=BroadcastResponse)
def broadcast_alert(req: BroadcastRequest):
    if req.risk_class not in ['CRITICAL', 'HIGH']:
        raise HTTPException(status_code=400, detail='Only CRITICAL or HIGH risk classes can be broadcasted.')
    return BroadcastResponse(
        status='success',
        message='Alert broadcast recorded',
        broadcast_id=f'BCAST-{uuid.uuid4().hex[:8].upper()}',
        timestamp=datetime.utcnow().isoformat() + 'Z'
    )

@router.get('/model-metrics')
def get_metrics():
    try:
        metrics_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'models', 'model_metrics.json'))
        with open(metrics_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
