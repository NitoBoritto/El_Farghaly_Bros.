import pandas as pd
from pathlib import Path
import sys

project_root = Path(__file__).parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from src.database.extract import load_db_table_to_dataframe
from database import get_db_engine


def db_to_csv():
    # Load Table to DataFrame
    df_bank = load_db_table_to_dataframe("Transformed.Bank", get_db_engine())

    # Save DataFrame to CSV
    output_path = Path(f"{project_root}/data/processed/transformed_bank.csv")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df_bank.to_csv(output_path, index=False, encoding="utf-8-sig")
    print(f"Saved to: {output_path.resolve()}")
    
if __name__ == '__main__':
    db_to_csv()