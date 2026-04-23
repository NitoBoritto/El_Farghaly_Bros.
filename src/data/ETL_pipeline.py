## Master Data Transformation Pipeline
## import etl functions from extract, preprocess, and to_db_loader & database connection
from database.extract import load_db_table_to_dataframe
from src.database.preprocess import process_data_pipeline
from src.database.to_db_loader import load_dataframe_to_db_table
from database import get_db_engine
def run_data_pipeline(source_table, target_table):
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
    df_raw = load_db_table_to_dataframe(source_table, engine)
    
    # Step 2: Process Data through Preprocessing Pipeline
    df_transformed = process_data_pipeline(df_raw)
    
    # Step 3: Load Transformed Data back to Database
    load_dataframe_to_db_table(df_transformed, target_table, engine)
    
    print("\n=== Data Transformation Pipeline Completed Successfully ===")