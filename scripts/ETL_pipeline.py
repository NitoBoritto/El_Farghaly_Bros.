## Master Data Transformation Pipeline
## import etl functions from extract, preprocess, and to_db_loader & database connection

import sys
from pathlib import Path
import argparse

# Bootstrap project root path for src imports
project_root = Path(__file__).parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from database import get_db_engine
from src.database.extract import load_db_table_to_dataframe
from src.database.preprocess import process_data_pipeline, build_dashboard_features
from src.database.to_db_loader import load_dataframe_to_db_table

def run_data_pipeline(source_table_name, target_table_name):
    """
    Executes the full data transformation pipeline:
    1. Extracts data from the source database table.
    2. Applies preprocessing transformations.
    3. Loads the transformed data into the target database table.
    
    Parameters:
    - source_table: str, name of the source database table to extract from
    - target_table: str, name of the target database table to load into
    
    Returns:
    - None
    """
    print("=== Running Data Transformation Pipeline ===\n")
    
    # Step 1: Connect to Database and Extract Data
    engine = get_db_engine()
    df_raw = load_db_table_to_dataframe(source_table_name, engine)
    
    # Step 2: Process Data through Preprocessing Pipeline
    df_transformed = process_data_pipeline(df_raw)

    # Step 3: Generate dashboard-ready features from the transformed data
    df_dashboard = build_dashboard_features(df_transformed)

    # Step 4: Load dashboard-ready DataFrame back to Database
    print(f'Loading DataFrame to {target_table_name}...')
    load_dataframe_to_db_table(df_dashboard, target_table_name, engine)
    
    print("\n=== Data Transformation Pipeline Completed Successfully ===")
    
def parse_args():
    """Parse command-line arguments"""
    parser = argparse.ArgumentParser(
        description="Cloud DB ETL Pipeline" 
    )
    
    parser.add_argument(
        "--source_table_name",
        type=str,
        default="Raw.Bank"
    )
    
    parser.add_argument(
        "--target_table_name",
        type=str,
        default="Transformed.Bank"
    )
    
    return parser.parse_args()
    
if __name__ == "__main__":
    args = parse_args()
    run_data_pipeline(args.source_table_name, args.target_table_name)
    
"""
To run this script:
python scripts/ETL_pipeline.py --source_table_name Raw.Bank --target_table_name Transformed.Bank

"""