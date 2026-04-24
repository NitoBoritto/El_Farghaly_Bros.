## take the data from the preprocessed data and load it to the transformed schema in the database
def _split_schema_and_table(table_name):
    """Split schema-qualified table name into (schema, table)."""
    if '.' in table_name:
        schema_name, raw_table_name = table_name.split('.', 1)
        return schema_name, raw_table_name
    return 'dbo', table_name


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
        schema_name, raw_table_name = _split_schema_and_table(table_name)
        df.to_sql(
            name=raw_table_name,
            schema=schema_name,
            con=engine,
            if_exists='replace',
            index=False
        )
        print(f"Successfully loaded DataFrame into '{schema_name}.{raw_table_name}' with shape {df.shape}")
    except Exception as e:
        print(f"Error loading DataFrame into table '{table_name}': {str(e)}")
        raise