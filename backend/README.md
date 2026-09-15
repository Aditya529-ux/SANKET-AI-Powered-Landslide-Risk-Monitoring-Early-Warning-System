# SANKET Backend API

This is the FastAPI backend for the SANKET landslide early-warning system prototype.

## Setup

1. **Create and activate a virtual environment** (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Running the API

Start the FastAPI server using Uvicorn:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

## Endpoints

- `GET /api/health`: Health check indicating if the model is loaded.
- `GET /api/summary`: Dashboard-level summary statistics.
- `GET /api/hotspots`: Geographical records with predictions and risk scores.
- `POST /api/predict`: Get a prediction for a single set of features.

### Example Request (`POST /api/predict`)
```json
{
  "latitude": 27.5,
  "longitude": 88.5,
  "rainfall_24h_mm": 120.5,
  "rainfall_72h_mm": 200.0,
  "rainfall_7d_mm": 350.0,
  "rainfall_intensity_3h_mm": 45.0,
  "rainfall_anomaly_pct": 15.0,
  "elevation_m": 1500.0,
  "slope_deg": 35.5,
  "aspect_deg": 180.0,
  "curvature": 0.5,
  "soil_moisture": 80.0,
  "clay_pct": 25.0,
  "ndvi": 0.6,
  "geology_risk_index": 3.0,
  "displacement_mm": 5.0,
  "historical_landslide_count": 2,
  "distance_to_road_km": 1.5,
  "distance_to_settlement_km": 2.0,
  "infrastructure_exposure_index": 2.5
}
```

### Example Response
```json
{
  "prediction": 1,
  "landslide_probability": 0.825,
  "risk_score": 82.5,
  "risk_class": "CRITICAL"
}
```

## Important Disclaimers

1. **Synthetic Data**: The current dataset used for training is synthetic/demo data. Do not treat the predictions as real-world validated outputs.
2. **Prototype Thresholds**: The risk thresholds (`0-34 LOW`, `35-54 MODERATE`, `55-74 HIGH`, `75-100 CRITICAL`) are prototype thresholds for demonstration purposes and are NOT scientifically validated warning thresholds.
3. **No Live Integrations**: This prototype currently does not integrate with live ISRO/IMD APIs.
