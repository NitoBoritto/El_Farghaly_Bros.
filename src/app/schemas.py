from pydantic import BaseModel, Field, ConfigDict

class bankingdata(BaseModel):
    """
    Customer data schema for prediction
    
    This schema defines X features and are required for prediction
    All features must match the original dataset in structure and consistency
    
    """
    model_config = ConfigDict(populate_by_name = True)
    
    # Client Data
    age: int = Field(description="Client's age in years")
    job: str = Field(description="Job type: admin., blue-collar, entrepreneur, housemaid, management, retired, self-employed, services, student, technician, unemployed, unknown")
    marital: str = Field(description="Marital status: divorced, married, single, unknown")
    education: str = Field(description="Education level: basic.4y, basic.6y, basic.9y, high.school, illiterate, professional.course, university.degree, unknown")
    default: str = Field(description="Has credit in default: no, yes, unknown")
    housing: str = Field(description="Has housing loan: no, yes, unknown")
    loan: str = Field(description="Has personal loan: no, yes, unknown")
    
    # Last contact (current campaign)
    contact: str = Field(description="Communication type: cellular or telephone")
    month: str = Field(description="Last contact month of year: jan-dec")
    day_of_week: str = Field(description="Last contact weekday: mon-fri")
    duration: int = Field(description="Last contact duration in seconds (NOTE: highly leaks target—if duration=0 then y='no')")
    
    # Other details
    campaign: int = Field(description="Number of contacts performed during this campaign for this client (includes last)")
    pdays: int = Field(description="Days since client was last contacted from previous campaign (999 = never contacted)")
    previous: int = Field(description="Number of contacts performed before this campaign for this client")
    poutcome: str = Field(description="Outcome of previous marketing campaign: failure, nonexistent, success")
    
    # Social/Economic features
    emp_var_rate: float = Field(alias='emp.var.rate', description="Employment variation rate — quarterly indicator")
    cons_conf_idx: float = Field(alias='cons.conf.idx', description="Consumer confidence index — monthly indicator")
    cons_price_idx: float = Field(alias='cons.price.idx', description="Consumer price index — monthly indicator")
    euribor3m: float = Field(description="Euribor 3-month rate — daily indicator")
    nr_employed: float = Field(alias='nr.employed', description="Number of employees — quarterly indicator")
    
    # Target
    y: str = Field(description="Has client subscribed to term deposit: 0=no, 1=yes")