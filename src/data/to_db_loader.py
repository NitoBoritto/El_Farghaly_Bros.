import pandas as pd
import logging
from database import get_db

# Reuse the same logging config to keep all logs in one file
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='pipeline.log'
)

class DataLoader:
    def __init__(self):
        """
        Initializes the connection using the central database module.
        
        """
        self.engine = get_db.engine()

    def load_clean_data(self, df, table_name='cleaned_analytics'):
        """
        Ingests the processed DataFrame into the production table.
        
        """
        logging.info(f"Starting ingestion into: {table_name}")
        
        if df is None or df.empty:
            logging.error("Loader received an empty or None DataFrame. Aborting.")
            return

        try:
            df.to_sql(
                name = table_name, 
                con=self.engine, 
                if_exists='replace', # Refreshing already cleaned data incase of redundancy
                index=False,
                chunksize=1000  # Good for memory management
            )
            
            logging.info(f"Successfully loaded {len(df)} rows into {table_name}.")
            
        except Exception as e:
            logging.error(f"Inversion failed: {str(e)}")
            raise