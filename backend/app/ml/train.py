import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.pipeline import Pipeline

# Adjust import path if needed
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))
from backend.app.ml.preprocess import get_preprocessor

DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'data', 'SANKET_ML_Ready_Dataset_2018_2025_20000.csv'))
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'models', 'landslide_model.pkl'))
METRICS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'models', 'model_metrics.json'))
INFO_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'models', 'model_info.json'))

def main():
    print("=== SANKET Landslide Early-Warning System: Model Training ===")
    
    if not os.path.exists(DATA_PATH):
        print(f"ERROR: Dataset not found at {DATA_PATH}")
        sys.exit(1)
        
    try:
        print(f"Loading dataset from: {DATA_PATH}")
        df = pd.read_csv(DATA_PATH)
    except Exception as e:
        print(f"ERROR: Failed to load dataset. {e}")
        sys.exit(1)
        
    print("\n--- Dataset Inspection ---")
    print(f"Shape: {df.shape}")
    print(f"Missing Values: {df.isnull().sum().sum()}")
    print(f"Duplicate Rows: {df.duplicated().sum()}")
    
    target_col = 'landslide_occurrence'
    if target_col not in df.columns:
        print(f"ERROR: Target column '{target_col}' missing from dataset.")
        sys.exit(1)
        
    print(f"Target Distribution:\n{df[target_col].value_counts()}")
    
    # Exclude non-feature columns
    exclude_cols = ['date', 'landslide_occurrence', 'risk_score_demo', 'risk_class_demo']
    feature_cols = [col for col in df.columns if col not in exclude_cols]
    
    categorical_cols = [col for col in feature_cols if df[col].dtype == 'object']
    numerical_cols = [col for col in feature_cols if df[col].dtype in ['int64', 'float64']]
    
    print("\n--- Feature Selection ---")
    print(f"Numerical Features ({len(numerical_cols)}): {numerical_cols}")
    print(f"Categorical Features ({len(categorical_cols)}): {categorical_cols}")
    
    X = df[feature_cols]
    y = df[target_col]
    
    print("\nSplitting data (80/20 stratified)...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    
    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, random_state=42)
    }
    
    results = {}
    best_model_name = None
    best_model_pipeline = None
    best_f1_roc_score = -1
    
    preprocessor = get_preprocessor(numerical_cols, categorical_cols)
    
    print("\n--- Training Models ---")
    for name, model in models.items():
        print(f"Training {name}...")
        try:
            pipeline = Pipeline(steps=[
                ('preprocessor', preprocessor),
                ('classifier', model)
            ])
            pipeline.fit(X_train, y_train)
            
            y_pred = pipeline.predict(X_test)
            y_prob = pipeline.predict_proba(X_test)[:, 1] if hasattr(pipeline, "predict_proba") else [0]*len(y_pred)
            
            acc = accuracy_score(y_test, y_pred)
            prec = precision_score(y_test, y_pred, zero_division=0)
            rec = recall_score(y_test, y_pred, zero_division=0)
            f1 = f1_score(y_test, y_pred, zero_division=0)
            roc_auc = roc_auc_score(y_test, y_prob)
            cm = confusion_matrix(y_test, y_pred).tolist()
            
            results[name] = {
                'accuracy': acc,
                'precision': prec,
                'recall': rec,
                'f1': f1,
                'roc_auc': roc_auc,
                'confusion_matrix': cm
            }
            
            combined_score = f1 + roc_auc
            if combined_score > best_f1_roc_score:
                best_f1_roc_score = combined_score
                best_model_name = name
                best_model_pipeline = pipeline
                
        except Exception as e:
            print(f"ERROR: Failed to train {name}. {e}")
            
    print("\n--- Evaluation Results ---")
    for name, metrics in results.items():
        print(f"{name}:")
        print(f"  Accuracy: {metrics['accuracy']:.4f}")
        print(f"  Precision: {metrics['precision']:.4f}")
        print(f"  Recall: {metrics['recall']:.4f}")
        print(f"  F1 Score: {metrics['f1']:.4f}")
        print(f"  ROC-AUC: {metrics['roc_auc']:.4f}")
    
    print(f"\nBest Model Selected: {best_model_name}")
    
    try:
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump(best_model_pipeline, MODEL_PATH)
        print(f"Model saved to: {MODEL_PATH}")
        
        with open(METRICS_PATH, 'w') as f:
            json.dump({
                "note": "Metrics obtained from prototype/development dataset. NOT real-world validated.",
                "best_model": best_model_name,
                "metrics": results
            }, f, indent=4)
        print(f"Metrics saved to: {METRICS_PATH}")
        
        with open(INFO_PATH, 'w') as f:
            json.dump({
                "note": "Metrics obtained from prototype/development dataset. NOT real-world validated.",
                "best_model": best_model_name,
                "numerical_features": numerical_cols,
                "categorical_features": categorical_cols,
                "target": target_col
            }, f, indent=4)
        print(f"Model info saved to: {INFO_PATH}")
    except Exception as e:
        print(f"ERROR: Failed to save model or metrics. {e}")
        sys.exit(1)

    print("\nTraining completed successfully.")

if __name__ == "__main__":
    main()
