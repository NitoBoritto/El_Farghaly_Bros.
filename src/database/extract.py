## Connect to Database (Transformed)
## Load CSV file into DataFrame
import pandas as pd
def load_db_table_to_dataframe(table_name, engine):
    """
    Loads a specified table from the database into a pandas DataFrame.
    
    Parameters:
    - table_name: str, name of the database table to load
    - engine: SQLAlchemy engine object for database connection
    
    Returns:
    - df: pandas DataFrame containing the loaded data
    table_name
    """
    try:
        df = pd.read_sql(f'SELECT * FROM {table_name}', con=engine)
        print(f"Successfully loaded '{table_name}' with shape {df.shape}")
        return df
    except Exception as e:
        print(f"Error loading table '{table_name}': {str(e)}")
        raise
