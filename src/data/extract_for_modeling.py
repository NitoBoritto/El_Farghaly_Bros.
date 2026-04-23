import pandas as pd
from database import get_db


def extract_for_modeling(table_name: str = "Transformed.Bank") -> pd.DataFrame:
	"""Return all rows from the target table as a pandas DataFrame."""
	query = f"SELECT * FROM {table_name}"

	db = next(get_db())
	try:
		return pd.read_sql(query, db.bind)
	finally:
		db.close()