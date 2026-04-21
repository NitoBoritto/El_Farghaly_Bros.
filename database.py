import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

# Grab the URL
# Ensureing .env has the variable
SQLALCHEMY_DATABASE_URL = os.getenv("AZURE_SQL_CONNECTION_STRING")

# Create the Engine
# fast_executemany = True is vital for performance goals with large datasets
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    fast_executemany = True
)

# Create the Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


if __name__ == "__main__":
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("Successfully connected to Azure SQL!")
    except Exception as e:
        print(f"Connection failed: {e}")