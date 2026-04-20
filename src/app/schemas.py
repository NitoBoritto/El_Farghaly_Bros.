from pydantic import BaseModel

class customerdata(BaseModel):
    """
    Customer data schema for prediction
    
    This schema defines X features and are required for prediction
    All features must match the original dataset in structure and consistency
    
    """