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


@app.get('/api/charts/personal-loan-by-age')
def personal_loan_by_age_chart_data():
    """
    Return aggregated personal-loan counts grouped by age segment.

    """

    engine = None
    try:
        engine = get_db_engine()

        query = text(
            f"""
            SELECT
                COALESCE(NULLIF(LTRIM(RTRIM(CAST(age_segment AS NVARCHAR(100)))), ''), 'Unknown') AS age_segment,
                SUM(
                    CASE
                        WHEN LOWER(LTRIM(RTRIM(CAST(loan AS NVARCHAR(20))))) IN ('yes', '1', 'true') THEN 1
                        ELSE 0
                    END
                ) AS loan_yes,
                SUM(
                    CASE
                        WHEN LOWER(LTRIM(RTRIM(CAST(loan AS NVARCHAR(20))))) IN ('yes', '1', 'true') THEN 0
                        ELSE 1
                    END
                ) AS loan_no
            FROM {DATASET_TABLE_NAME}
            GROUP BY COALESCE(NULLIF(LTRIM(RTRIM(CAST(age_segment AS NVARCHAR(100)))), ''), 'Unknown')
            ORDER BY CASE
                WHEN COALESCE(NULLIF(LTRIM(RTRIM(CAST(age_segment AS NVARCHAR(100)))), ''), 'Unknown') = 'Young' THEN 1
                WHEN COALESCE(NULLIF(LTRIM(RTRIM(CAST(age_segment AS NVARCHAR(100)))), ''), 'Unknown') = 'Middle-aged' THEN 2
                WHEN COALESCE(NULLIF(LTRIM(RTRIM(CAST(age_segment AS NVARCHAR(100)))), ''), 'Unknown') = 'Senior' THEN 3
                ELSE 4
            END
            """
        )

        with engine.connect() as connection:
            rows = connection.execute(query).mappings().all()

        labels = [str(row['age_segment']) for row in rows]
        loan_yes = [int(row['loan_yes']) for row in rows]
        loan_no = [int(row['loan_no']) for row in rows]

        return {
            'table': DATASET_TABLE_NAME,
            'labels': labels,
            'loan_yes': loan_yes,
            'loan_no': loan_no,
        }

    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Failed to aggregate personal loan chart data: {exc}') from exc
    finally:
        if engine is not None:
            engine.dispose()


@app.get('/api/charts/campaigns-by-month')
def campaigns_by_month_chart_data():
    """
    Return total number of campaigns aggregated by month.

    Notes:
    - The DB stores month as integer.
    - campaign is coerced to int in SQL to tolerate type drift.
    """

    engine = None
    try:
        engine = get_db_engine()

        query = text(
            f"""
            SELECT
                TRY_CAST([month] AS INT) AS month_num,
                SUM(COALESCE(TRY_CAST(campaign AS INT), 0)) AS campaigns_total
            FROM {DATASET_TABLE_NAME}
            WHERE TRY_CAST([month] AS INT) BETWEEN 1 AND 12
            GROUP BY TRY_CAST([month] AS INT)
            ORDER BY month_num
            """
        )

        with engine.connect() as connection:
            rows = connection.execute(query).mappings().all()

        month_names = {
            1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr',
            5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug',
            9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec',
        }

        campaigns_by_month = {int(row['month_num']): int(row['campaigns_total']) for row in rows}
        labels = [month_names[m] for m in range(1, 13)]
        campaigns_total = [campaigns_by_month.get(m, 0) for m in range(1, 13)]

        return {
            'table': DATASET_TABLE_NAME,
            'labels': labels,
            'campaigns_total': campaigns_total,
        }

    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Failed to aggregate campaigns by month: {exc}') from exc
    finally:
        if engine is not None:
            engine.dispose()


@app.get('/api/charts/default-by-job')
def default_by_job_chart_data():
    """
    Return yes/no default counts grouped by job title.

    Notes:
    - DB datatypes may differ from Pydantic schema, so values are normalized in SQL.
    - Any non-yes value is counted in the no bucket to preserve a strict yes/no split.
    """

    engine = None
    try:
        engine = get_db_engine()

        query = text(
            f"""
            SELECT
                COALESCE(NULLIF(LTRIM(RTRIM(CAST(job AS NVARCHAR(100)))), ''), 'Unknown') AS job_title,
                SUM(
                    CASE
                        WHEN LOWER(LTRIM(RTRIM(CAST([default] AS NVARCHAR(20))))) IN ('yes', '1', 'true') THEN 1
                        ELSE 0
                    END
                ) AS default_yes,
                SUM(
                    CASE
                        WHEN LOWER(LTRIM(RTRIM(CAST([default] AS NVARCHAR(20))))) IN ('yes', '1', 'true') THEN 0
                        ELSE 1
                    END
                ) AS default_no
            FROM {DATASET_TABLE_NAME}
            GROUP BY COALESCE(NULLIF(LTRIM(RTRIM(CAST(job AS NVARCHAR(100)))), ''), 'Unknown')
            ORDER BY job_title
            """
        )

        with engine.connect() as connection:
            rows = connection.execute(query).mappings().all()

        labels = [str(row['job_title']) for row in rows]
        default_yes = [int(row['default_yes']) for row in rows]
        default_no = [int(row['default_no']) for row in rows]

        return {
            'table': DATASET_TABLE_NAME,
            'labels': labels,
            'default_yes': default_yes,
            'default_no': default_no,
        }

    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Failed to aggregate default by job: {exc}') from exc
    finally:
        if engine is not None:
            engine.dispose()


@app.get('/api/charts/financial-commitment-level')
def financial_commitment_level_chart_data():
    """
    Return customer counts grouped by financial commitment level.

    The chart reads directly from the transformed dataset column
    financial_commitment_level, which is derived from housing + loan.
    """

    engine = None
    try:
        engine = get_db_engine()

        query = text(
            f"""
            SELECT
                COALESCE(TRY_CAST(financial_commitment_level AS INT), -1) AS commitment_level,
                COUNT(*) AS customer_count
            FROM {DATASET_TABLE_NAME}
            GROUP BY COALESCE(TRY_CAST(financial_commitment_level AS INT), -1)
            ORDER BY commitment_level
            """
        )

        with engine.connect() as connection:
            rows = connection.execute(query).mappings().all()

        level_labels = {
            -1: 'Unknown',
            0: 'Level 0 - No housing or loan commitment',
            1: 'Level 1 - Single commitment',
            2: 'Level 2 - Dual commitment',
        }

        labels = [level_labels.get(int(row['commitment_level']), f'Level {int(row["commitment_level"])}') for row in rows]
        values = [int(row['customer_count']) for row in rows]

        return {
            'table': DATASET_TABLE_NAME,
            'column': 'financial_commitment_level',
            'labels': labels,
            'values': values,
        }

    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Failed to aggregate financial commitment level data: {exc}') from exc
    finally:
        if engine is not None:
            engine.dispose()


@app.get('/api/overview/performance')
def performance_overview_metrics():
    """
    Return the key performance overview metrics for the KPI cards.
    """

    engine = None
    try:
        engine = get_db_engine()

        query = text(
            f"""
            WITH cleaned AS (
                SELECT
                    TRY_CAST(y AS NVARCHAR(20)) AS y_value,
                    TRY_CAST(duration AS FLOAT) AS duration_value,
                    COALESCE(NULLIF(LTRIM(RTRIM(CAST(macro_environment_label AS NVARCHAR(100)))), ''), 'Unknown') AS macro_environment_label_value,
                    TRY_CAST(engagement_score AS FLOAT) AS engagement_score_value
                FROM {DATASET_TABLE_NAME}
            )
            SELECT
                COUNT(*) AS total_customers,
                SUM(CASE WHEN LOWER(LTRIM(RTRIM(COALESCE(y_value, '')))) IN ('yes', '1', 'true') THEN 1 ELSE 0 END) AS subscription_yes,
                SUM(CASE WHEN LOWER(LTRIM(RTRIM(COALESCE(y_value, '')))) IN ('yes', '1', 'true') THEN 0 ELSE 1 END) AS subscription_no,
                AVG(duration_value) AS avg_call_duration,
                AVG(engagement_score_value) AS avg_engagement_score
            FROM cleaned;
            """
        )

        with engine.connect() as connection:
            overview_row = connection.execute(query).mappings().one()

            macro_query = text(
                f"""
                SELECT TOP 1
                    COALESCE(NULLIF(LTRIM(RTRIM(CAST(macro_environment_label AS NVARCHAR(100)))), ''), 'Unknown') AS macro_environment_label,
                    COUNT(*) AS label_count
                FROM {DATASET_TABLE_NAME}
                GROUP BY COALESCE(NULLIF(LTRIM(RTRIM(CAST(macro_environment_label AS NVARCHAR(100)))), ''), 'Unknown')
                ORDER BY COUNT(*) DESC, macro_environment_label ASC;
                """
            )
            macro_row = connection.execute(macro_query).mappings().first()

        total_customers = int(overview_row['total_customers'] or 0)
        subscription_yes = int(overview_row['subscription_yes'] or 0)
        subscription_no = int(overview_row['subscription_no'] or 0)
        subscription_total = subscription_yes + subscription_no
        subscription_rate = (subscription_yes / subscription_total * 100.0) if subscription_total else 0.0

        return {
            'table': DATASET_TABLE_NAME,
            'total_customers': total_customers,
            'subscription_rate': round(subscription_rate, 2),
            'avg_call_duration': round(float(overview_row['avg_call_duration'] or 0.0), 2),
            'most_frequent_macro_environment': str((macro_row or {}).get('macro_environment_label', 'Unknown')),
            'avg_engagement_score': round(float(overview_row['avg_engagement_score'] or 0.0), 2),
        }

    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Failed to load performance overview metrics: {exc}') from exc
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
