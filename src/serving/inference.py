"""
Inference pipeline - Production ML Model Serving with Feature Consistency

This module provides the core inference functionality for the Telco Churn prediction model.
It ensures that serving-time feature transformations exactly match training-time transformations,
which is CRITICAL for model accuracy in production.

Key Responsibilities:
1. Load MLflow-logged model and feature metadata from training
2. Apply identical feature transformations as used during training
3. Ensure correct feature ordering for model input
4. Convert model predictions to user-friendly output

"""

import os
import pandas as pd
import mlflow
import mlflow.sklearn
import glob

from src.utils.validate import validate_data

# Model loading configuration
# IMPORTANT: This path is set during docker container build
# Locally: use local mlflow logged models
# In prod: use /app/model models from container

model_dir = '/app/model'

try:
    
    model = mlflow.sklearn.load_model(model_dir)
    print(f'✅ Model loaded successfully from {model_dir}')
except Exception as e:
    print(f'❌ Failed to load model from {model_dir}: {e}')
    # If this happens fallback for local development
    try:
        # Loading local logged models
        local_model_dir = glob.glob('./src/serving/model')
        if local_model_dir:
            latest_model = max(local_model_dir, key = os.path.getmtime)
            model = mlflow.sklearn.load_model(latest_model)
            model_dir = latest_model            
            print(f'✅ Model loaded successfully from {latest_model}')
        else:
            raise Exception('No model was find in local directory')
    except Exception as fallback_error:
        raise Exception(f'Failed to load model: {e}. Fallback failed: {fallback_error}')
    
def predict(input_dict: dict) -> str:
    """
    Where predictions happen
    
    """
    
    df = pd.DataFrame([input_dict])
    
    is_valid, error_message = validate_data(df)
    
    if not is_valid:
        raise Exception(f'Data validation failed: {error_message}')
    
    prediction = model.predict(df)
    probability = model.predict_proba(df)

    subscribe_proba = float(probability[0][1])
    prediction_label = 'Likely to subscribe' if prediction[0] == 1 else "Unlikely to subscribe"
    
    return {'prediction': prediction_label,
            'probability': round(subscribe_proba * 100, 2)}