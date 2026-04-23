import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

def get_db_engine():
    """
    Creates and returns a SQLAlchemy engine for connecting to the database.
    
    The connection parameters are read from environment variables:
    - DB_USER: Database username
    - DB_PASSWORD: Database password
    - DB_HOST: Database host (e.g., localhost)
    - DB_PORT: Database port (e.g., 5432 for PostgreSQL)
    - DB_NAME: Database name
    
    Returns:
    - engine: SQLAlchemy engine object for database connection
    """
    try:
        db_user = os.getenv('DB_USER')
        db_password = os.getenv('DB_PASSWORD')
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = os.getenv('DB_PORT', '5432')
        db_name = os.getenv('DB_NAME')

        if not all([db_user, db_password, db_name]):
            raise ValueError("Database credentials (DB_USER, DB_PASSWORD, DB_NAME) must be set in environment variables.")

        connection_string = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        engine = create_engine(connection_string)
        print("Database engine created successfully.")
        return engine
    except Exception as e:
        print(f"Error creating database engine: {str(e)}")
        raise