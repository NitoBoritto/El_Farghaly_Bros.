import os
from fastapi import FastAPI
from pydantic import BaseModel

from src.serving.inference import predict

app = FastAPI(
    title = 'Client term deposit predictor & classifier',
    description = 'ML API for classifying clients who will subscribe to the bank term deposit',
    version = '1.0.0'
)

@app.get('/')
def root():
    """
    Health diagnostic endpoint check
    
    """
    
    return {'status': 'ok'}

class customerdata(BaseModel):
    """
    Customer data schema for prediction
    
    This schema defines X features and are required for prediction
    All features must match the original dataset in structure and consistency
    
    """
    
@app.post('/predict')
def get_prediction(data: customerdata):
    """
    Main prediction output function
    
    This endpoint:
    1. Receives validated customer data via Pydantic model
    2. Calls the inference pipeline to transform features and predict
    3. Returns churn prediction in JSON format
    
    Expected Response:
    - {"prediction": "Will likely subscribe"} or {"prediction": "Will not likely subscribe"}
    - {"error": "error_message"} if prediction fails
    
    """
    
    try:
        input_dict  = data.model_dump()
        # Converting Pydantic model to a dict to call the inference pipeline
        result = predict(input_dict)
        return result
    
    except Exception as e:
        # Tracing errors
        import traceback
        print('---- Backend Traceback ----')
        traceback.print_exc()
        print('---------------------------')
        
        return {'error': str(e)}