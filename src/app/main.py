from fastapi import FastAPI, HTTPException

from src.serving.inference import predict
from src.app.schemas import PredictionResponse, bankingdata

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

    
@app.post('/predict', response_model=PredictionResponse)
def get_prediction(data: bankingdata):
    """
    Main prediction output function
    
    This endpoint:
    1. Receives validated customer data via Pydantic model
    2. Calls the inference pipeline to transform features and predict
    3. Returns churn prediction in JSON format
    
    Expected Response:
    - {"prediction": "Likely to subscribe", "probability": 0.83, "confidence": 83.0, "risk_score": 17.0}
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
        
        raise HTTPException(status_code=500, detail=str(e))
    
    
"""
To Initialize FastAPI:
uvicorn src.app.main:app --host 127.0.0.1 --port 8000 --reload

"""
