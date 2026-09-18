SANKET --- AI-Powered Geospatial Landslide Risk Monitoring & Early Warning System

AI-powered decision support for landslide risk monitoring across the
North Eastern Region of India.

🌍 Overview

SANKET is an AI-powered geospatial landslide risk monitoring and
early-warning decision-support system designed for the North Eastern
Region (NER) of India.

The platform combines environmental, terrain, soil, vegetation,
geological, historical and infrastructure-exposure features with
supervised machine learning to estimate landslide occurrence probability
and convert it into an interpretable risk score.

Core capabilities

AI-based landslide risk prediction

Interactive GIS risk visualization

Risk hotspot prioritization

AI risk analysis

Historical analysis

Model comparison

Alert-management workflow

REST APIs for prediction and dashboard data

Prototype note: SANKET is an academic/development decision-support
system. Its risk thresholds and model results have not been presented
as operationally validated government warning thresholds.

🎯 Problem Statement

The North Eastern Region of India contains mountainous and highly varied
terrain where rainfall, slope, soil moisture, geological conditions,
vegetation, historical landslide activity and human exposure can
contribute to landslide risk.

SANKET addresses this challenge by bringing multiple risk-related
variables into one platform and using machine learning to estimate
landslide occurrence probability, prioritize geographic hotspots, and
support early-warning decisions.

✨ Features

🤖 AI Risk Prediction

Three supervised classifiers were implemented and evaluated:

Logistic Regression

Random Forest

Gradient Boosting

Logistic Regression is currently used as the final production model
in the SANKET risk engine.

🗺️ GIS Risk Map

Interactive OpenStreetMap/Leaflet map

Risk-level filtering

Geographic hotspot visualization

State-level monitoring

Priority-zone analysis

📊 AI Risk Analysis

For a prediction, SANKET can expose:

Landslide probability

Risk score from 0--100

Risk level

Environmental/geospatial input context

🚨 Alert Management

The dashboard provides an early-warning alert workflow for high and
critical risk zones.

The current /api/alerts/broadcast endpoint records a broadcast request
for the prototype workflow. It does not currently deliver SMS,
WhatsApp, or phone notifications.

📈 Historical Analysis

The dashboard can analyze the development dataset for historical
occurrence and risk patterns.

📋 Reports

The Reports section compares the trained models using:

Accuracy

Precision

Recall

F1-score

ROC-AUC

🧠 Machine Learning

Dataset

SANKET uses a Kaggle-sourced development dataset containing 20,000
records covering:

Assam

Arunachal Pradesh

Meghalaya

Manipur

Mizoram

Nagaland

Sikkim

Tripura

The development coordinates were geographically validated/corrected to
align with the state labels. They should not be interpreted as original
historical event coordinates.

Dataset statistics

Property                                     Value

Total records                               20,000
ML features                                     20
Target                      landslide_occurrence
Landslide-class records                      8,775
Non-landslide records                       11,225
States                                           8
Train/test split                             80/20
Test records                                 4,000
Random state                                    42

20 ML Features

rainfall_24h_mm
rainfall_72h_mm
rainfall_7d_mm
rainfall_intensity_3h_mm
rainfall_anomaly_pct
elevation_m
slope_deg
aspect_deg
curvature
soil_moisture
clay_pct
ndvi
geology_risk_index
displacement_mm
historical_landslide_count
distance_to_road_km
distance_to_settlement_km
infrastructure_exposure_index
latitude
longitude

The target is:

landslide_occurrence

The demonstration-only columns risk_score_demo and risk_class_demo
are excluded from training to avoid target leakage.

🧪 Data & Training Pipeline

Kaggle-sourced Dataset
        ↓
Data Validation
        ↓
Feature / Target Separation
        ↓
Stratified 80/20 Split
        ↓
Preprocessing
        ↓
Model Training
        ↓
Model Evaluation
        ↓
Selected Model
        ↓
Risk Engine
        ↓
Dashboard / GIS / Alerts

Data-quality checks included missing values, duplicate rows, infinite
values, and geographic consistency.

For Logistic Regression, the preprocessing pipeline uses median
imputation followed by standardization.

Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
    ("model", LogisticRegression(max_iter=2000))
])

🏆 Model Implementation

Logistic Regression

LogisticRegression(max_iter=2000)

Probability:

[
P(y=1|X)=rac{1}{1+e^{-(eta_0+eta_1x_1+\cdots{=tex}+eta_{20}x_{20})}}
]

Random Forest

RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    n_jobs=-1
)

The model uses 300 decision trees and combines their predictions as an
ensemble.

Gradient Boosting

GradientBoostingClassifier(
    n_estimators=150,
    learning_rate=0.05,
    max_depth=3,
    random_state=42
)

The model builds decision trees sequentially, with later trees learning
from errors made by earlier trees.

📊 Model Evaluation

All models used the same stratified 80/20 split and the same 20 input
features.

Model              Accuracy    Precision       Recall     F1-Score      ROC-AUC

Logistic       79.67%       80.08%       71.45%   75.52%   87.19%
Regression

Random Forest        79.53%       80.39%       70.54%       75.14%       86.47%

Logistic Regression was selected as the current final model based on the
project's test-set evaluation.

Confusion matrix --- Logistic Regression

                 Predicted
                0       1
Actual  0     1933     312
        1      501    1254

⚠️ Risk Engine

The selected model outputs a landslide probability.

SANKET converts it to a 0--100 score:

[ RiskScore=P( ext{landslide}) imes100 ]

Current prototype thresholds:

  Score Risk Level

  0--34 🟢 Low
 35--54 🟡 Moderate
 55--74 🟠 High
75--100 🔴 Critical

These thresholds are prototype thresholds and require domain-specific
calibration before operational warning use.

📐 Evaluation Metrics

Accuracy

[ Accuracy=rac{TP+TN}{TP+TN+FP+FN} ]

Precision

[ Precision=rac{TP}{TP+FP} ]

Recall

[ Recall=rac{TP}{TP+FN} ]

F1-Score

[ F1=2 imesrac{Precision imes Recall}{Precision+Recall} ]

ROC-AUC

ROC-AUC evaluates the model's ability to distinguish the two classes
across decision thresholds.

Why R² is not reported

R² is a regression metric. SANKET predicts the binary target
landslide_occurrence, so classification metrics such as Accuracy,
Precision, Recall, F1-score and ROC-AUC are used instead.

🏗️ System Architecture

                         ┌───────────────────┐
                         │ User / Authority  │
                         └─────────┬─────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │ React + Vite Dashboard   │
                    │                          │
                    │ Overview                 │
                    │ Risk Map                 │
                    │ AI Risk Analysis          │
                    │ Alerts                   │
                    │ Historical Analysis      │
                    │ Reports                  │
                    │ Team / Settings          │
                    └────────────┬─────────────┘
                                 │ REST API
                                 ▼
                    ┌──────────────────────────┐
                    │       FastAPI Backend    │
                    └────────────┬─────────────┘
                                 │
              ┌──────────────────┼─────────────────┐
              ▼                  ▼                 ▼
       ┌─────────────┐    ┌─────────────┐   ┌────────────┐
       │ Risk Engine │    │ ML Model    │   │ Data Layer │
       │             │    │ Logistic    │   │ CSV/SQLite │
       │ Score/Class  │    │ Regression  │   │            │
       └─────────────┘    └─────────────┘   └────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ Risk / Hotspot / Alert   │
                    │ Decision-Support Output   │
                    └──────────────────────────┘

💻 Technology Stack

Frontend

React

TypeScript

Vite

Leaflet

React-Leaflet

React-Leaflet-Cluster

CSS

Backend

Python

FastAPI

Pydantic

Uvicorn

Machine Learning

Scikit-learn

NumPy

SciPy

Pandas

Joblib

Data / Storage

CSV

SQLite

GIS

OpenStreetMap

Leaflet

Deployment

GitHub

Vercel

Render

📁 Project Structure

SANKET/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── ml/
│   │   └── main.py
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.*
│
├── models/
│   ├── landslide_model.pkl
│   ├── model_info.json
│   └── model_metrics.json
│
├── data/
│   └── SANKET_ML_Ready_Final_20000.csv
│
└── README.md

🚀 Run Locally

Prerequisites

Python 3.11

Node.js + npm

Git

1. Clone

git clone https://github.com/Aditya529-ux/SANKET-AI-Powered-Landslide-Risk-Monitoring-Early-Warning-System.git
cd SANKET-AI-Powered-Landslide-Risk-Monitoring-Early-Warning-System

2. Backend

python -m venv .venv

Windows:

.venv\Scriptsctivate

Install dependencies:

pip install -r backend/requirements.txt

Start:

cd backend
uvicorn app.main:app --reload

Backend:

http://127.0.0.1:8000

Swagger:

http://127.0.0.1:8000/docs

3. Frontend

Open a second terminal:

cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173

Configure the API URL:

VITE_API_URL=http://127.0.0.1:8000

🔌 API Endpoints

Method   Endpoint                  Purpose

GET      /api/health             API/model health
POST     /api/predict            Landslide-risk prediction
GET      /api/summary            Dashboard summary
GET      /api/hotspots           Risk hotspots
GET      /api/model-metrics      Model metrics
POST     /api/alerts/broadcast   Record alert broadcast

Example:

{
  "status": "ok",
  "service": "SANKET API",
  "model_loaded": true
}

☁️ Deployment

The current deployment architecture is:

GitHub
   ├── Frontend → Vercel
   └── Backend  → Render

Frontend

Root Directory: frontend
Build Command: npm run build
Output Directory: dist

Set:

VITE_API_URL=<backend-url>

Backend

Build Command:
pip install -r backend/requirements.txt

Start Command:
cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT

The backend uses a compatible Python/scikit-learn environment for the
saved model artifact.

🔐 Security

For production deployment:

Keep API credentials in environment variables.

Never commit .env files or secrets.

Validate API input.

Restrict CORS origins.

Authenticate administrative alert operations.

Add role-based authorization.

Log alert actions for auditing.

Use HTTPS.

📱 Future Notification Integration

The alert workflow can later be connected to:

Telegram

SMS gateways

WhatsApp Business API

Mobile push notifications

Government emergency communication infrastructure

Notification credentials should always be stored as secure environment
variables.

📈 Current Prototype Output

Current development-data summary:

{
  "total_records": 20000,
  "critical_zones": 4770,
  "high_risk_zones": 2242,
  "moderate_zones": 2782,
  "low_risk_zones": 10206,
  "landslide_events": 8775,
  "states_monitored": 8
}

These values describe the current development dataset and risk-engine
output; they are not live national monitoring statistics.

⚠️ Limitations

The development dataset is Kaggle-sourced rather than a live
operational sensor stream.

Coordinates were corrected/validated for geographic consistency and
should not be treated as original historical event coordinates.

The current model has not been independently validated for
operational deployment.

Prototype risk thresholds require domain-specific calibration.

The current alert endpoint records broadcast requests but does not
deliver phone/SMS/WhatsApp messages.

Live IMD/ISRO feeds are not currently connected.

Model performance may change on independently collected geographic
and temporal data.

🚀 Future Scope

Live rainfall and weather feeds

Real-time soil-moisture/sensor integration

Satellite-based change detection

Computer-vision analysis of field photographs

Calibrated rainfall-trigger thresholds

Telegram/SMS/WhatsApp delivery

Multilingual citizen notifications

Offline-first mobile application

GPS-based field reporting

Explainable AI

Temporal forecasting

Independent historical validation

Authoritative meteorological and geospatial data integration

Role-based access control

👥 Team

Member                                          ID Role

Aditya Kumar                            12403769 Team Leader & Project
Sharma                                           Lead

Sparsh Gupta                          12415691 AI/ML & Risk
Intelligence Lead

Lakshya Pandey                        12408450 GIS & Geospatial
Systems Engineer

Him Sinha                             12409999 Computer Vision &
Field Verification
Engineer

Shagun Singh                          12409799 Frontend & UI/UX
Engineer

✅ Project Status

Implemented

20,000-record development dataset

Geographic validation/correction workflow

20-feature ML pipeline

Logistic Regression

Random Forest

Gradient Boosting

Model evaluation and comparison

Risk scoring engine

FastAPI backend

React + Vite dashboard

Interactive GIS risk map

Hotspot analysis

Historical analysis

Alert-management workflow

Model artifacts

GitHub repository

Vercel frontend deployment

Render backend deployment

Planned

Real phone notification delivery

Live meteorological/sensor feeds

Satellite-data integration

Operational model validation

Production authentication/authorization

Mobile application

📚 References

The project draws on publicly available research and domain resources
concerning landslide inventories, machine learning for landslide
analysis, rainfall-triggered landslide thresholds, and geospatial
early-warning systems.

Relevant resources include:

ISRO Landslide Atlas of India

Research on machine learning for landslide prevention

Research on rainfall thresholds for landslide early-warning systems
in India

Recent landslide susceptibility research in Northeast India

📄 License

This repository is intended for academic, research and prototype
development.

Add an explicit open-source license such as MIT or Apache-2.0 before
distributing the project under an open-source license.

<p align="center">

<b>{=html}SANKET</b>{=html}<br>{=html} <i>{=html}AI-Powered
Landslide Risk Monitoring & Early Warning Decision
Support</i>{=html}<br>{=html}<br>{=html} <b>{=html}Safer
Tomorrows for Higher Grounds.</b>{=html}

</p>
