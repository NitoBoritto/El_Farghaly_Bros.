from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from database import get_db_engine
from src.serving.inference import predict
from src.app.schemas import PredictionResponse, bankingdata
from src.database.extract import load_db_table_to_dataframe

app = FastAPI(
    title = 'Client term deposit predictor & classifier',
    description = 'ML API for classifying clients who will subscribe to the bank term deposit',
    version = '1.0.0'
)

basic_dir = Path(__file__).resolve().parent
statis_dir = basic_dir / 'static'
html_dir = statis_dir / 'html'

app.mount('/css', StaticFiles(directory=statis_dir / 'css'), name='css')
app.mount('/js', StaticFiles(directory=statis_dir / 'js'), name='js')
app.mount('/images', StaticFiles(directory=statis_dir / 'images'), name='images')

DATASET_TABLE_NAME = 'Transformed.Bank'
MAX_DATASET_PREVIEW_ROWS = 200

@app.get('/')
def root():
    """
    Serve dashboard page from backend root route.

    """

    return FileResponse(html_dir / 'body.html')


@app.get('/health')
def health_check():
    """
    Health diagnostic endpoint check.

    """

    return {'status': 'ok'}


@app.get('/api/dataset/transformed-bank')
def transformed_bank_preview(
    limit: int = Query(default=200, ge=1, le=MAX_DATASET_PREVIEW_ROWS)
):
    """
    Return a preview of rows from Transformed.Bank for the dataset explorer.

    """

    engine = None
    try:
        engine = get_db_engine()

        preview_source = f'(SELECT TOP {limit} * FROM {DATASET_TABLE_NAME}) AS dataset_preview'
        preview_df = load_db_table_to_dataframe(preview_source, engine)
        preview_df = preview_df.where(preview_df.notna(), None)

        with engine.connect() as connection:
            total_rows = connection.execute(
                text(f'SELECT COUNT(*) FROM {DATASET_TABLE_NAME}')
            ).scalar_one()

        return {
            'table': DATASET_TABLE_NAME,
            'total_rows': int(total_rows),
            'preview_rows': int(len(preview_df)),
            'columns': preview_df.columns.tolist(),
            'rows': preview_df.to_dict(orient='records'),
        }

    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Failed to load dataset preview: {exc}') from exc
    finally:
        if engine is not None:
            engine.dispose()

    
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
        input_dict  = data.model_dump(by_alias = True)
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
