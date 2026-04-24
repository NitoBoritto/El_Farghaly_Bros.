import pandas as pd
from database import get_db_engine

def extract_for_modeling(table_name: str = "Transformed.Bank") -> pd.DataFrame:
    """Return all rows from the target table as a pandas DataFrame."""
    query = f"SELECT * FROM {table_name}"
    engine = get_db_engine()
    try:
        return pd.read_sql(query, con=engine)
    finally:
        engine.dispose()