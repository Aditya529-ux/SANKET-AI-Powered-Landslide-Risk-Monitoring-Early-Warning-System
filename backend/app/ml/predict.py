import os
import joblib
import pandas as pd
import json

MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'models', 'landslide_model.pkl'))
INFO_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'models', 'model_info.json'))

class LandslidePredictor:
    def __init__(self):
        self.pipeline = None
        self.model_info = None
        self.is_loaded = False
        self._load_model()
        
    def _load_model(self):
        if os.path.exists(MODEL_PATH) and os.path.exists(INFO_PATH):
            try:
                self.pipeline = joblib.load(MODEL_PATH)
                with open(INFO_PATH, 'r') as f:
                    self.model_info = json.load(f)
                self.is_loaded = True
            except Exception as e:
                print(f"Error loading model: {e}")
                self.is_loaded = False
        else:
            print("Model files not found.")
            
    def predict(self, input_data: dict) -> dict:
        """
        Make a prediction based on input data.
        input_data should be a dictionary mapping feature names to values.
        """
        if not self.is_loaded:
            raise RuntimeError("Model pipeline is not loaded.")
            
        df = pd.DataFrame([input_data])
        
        required_cols = self.model_info['numerical_features'] + self.model_info['categorical_features']
        for col in required_cols:
            if col not in df.columns:
                df[col] = pd.NA
                
        df = df[required_cols]
        
        prediction = self.pipeline.predict(df)[0]
        # Get probability of class 1
        probability = self.pipeline.predict_proba(df)[0][1] if hasattr(self.pipeline, "predict_proba") else None
        
        return {
            "prediction": int(prediction),
            "landslide_probability": float(probability) if probability is not None else float(prediction)
        }

    def predict_batch(self, df: pd.DataFrame) -> tuple:
        """
        Make batch predictions for a DataFrame.
        Returns a tuple of (predictions, probabilities).
        """
        if not self.is_loaded:
            raise RuntimeError("Model pipeline is not loaded.")
            
        required_cols = self.model_info['numerical_features'] + self.model_info['categorical_features']
        df_eval = df.copy()
        
        for col in required_cols:
            if col not in df_eval.columns:
                df_eval[col] = pd.NA
                
        df_eval = df_eval[required_cols]
        
        predictions = self.pipeline.predict(df_eval)
        probabilities = self.pipeline.predict_proba(df_eval)[:, 1] if hasattr(self.pipeline, "predict_proba") else predictions
        
        return predictions, probabilities

predictor = LandslidePredictor()
