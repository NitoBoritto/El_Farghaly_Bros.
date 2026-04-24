import os
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

def get_db_engine():
    azure_sql_connection_string = os.getenv("AZURE_SQL_CONNECTION_STRING")

    if not azure_sql_connection_string:
        raise ValueError(
            "AZURE_SQL_CONNECTION_STRING must be set in environment variables."
        )

    engine = create_engine(azure_sql_connection_string)
    print("Database engine created successfully.")
    return engine