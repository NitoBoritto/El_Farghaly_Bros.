## take the data from the preprocessed data and load it to the transformed schema in the database
import pandas as pd
def load_dataframe_to_db_table(df, table_name, engine):
    """
    Loads a pandas DataFrame into a specified table in the database.
    
    Parameters:
    - df: pandas DataFrame to be loaded
    - table_name: str, name of the target database table
    - engine: SQLAlchemy engine object for database connection
    
    Returns:
    - None
    """
    try:
        df.to_sql(name=table_name, con=engine, if_exists='replace', index=False)
        print(f"Successfully loaded DataFrame into '{table_name}' with shape {df.shape}")
    except Exception as e:
        print(f"Error loading DataFrame into table '{table_name}': {str(e)}")
        raise