import pandas as pd
def process_data_pipeline(df_input):
    """
    Master Pipeline to apply all string and temporal transformations in sequence
    with an execution summary report, excluding data type conversion.
    """
    print("=== Starting Data Transformation Pipeline ===\n")
    df_work = df_input.copy()

    # Step 1: Force all to string as requested previously
    df_work = df_work.astype(str)
    print(f"[Step 1] String Conversion: Completed. Current shape: {df_work.shape}")

    # Step 2: Standardize Job, Marital, and Education
    # (Using logic from standardize_text_columns)
    if 'job' in df_work.columns:
        df_work['job'] = df_work['job'].str.replace('-', ' ', regex=False).str.replace('.', ' ', regex=False).str.strip()
    if 'marital' in df_work.columns:
        df_work['marital'] = df_work['marital'].replace('divorced', 'divorced & widowed')
    
    education_mapping = {
        'basic.4y': 'primary school', 'basic.6y': 'middle school', 'basic.9y': 'secondary school',
        'high.school': 'high school', 'professional.course': 'professional course',
        'university.degree': 'university degree', 'illiterate': 'illiterate', 'unknown': 'unknown'
    }
    if 'education' in df_work.columns:
        df_work['education'] = df_work['education'].replace(education_mapping)
    print("[Step 2] Job, Marital, and Education Standardization: Completed.")

    # Step 3: Encode Temporal Columns (Month/Day)
    # (Using logic from encode_temporal_columns)
    month_map = {'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6, 'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12}
    day_map = {'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6, 'sun': 7}
    
    if 'month' in df_work.columns:
        df_work['month'] = df_work['month'].str.lower().map(month_map)
    if 'day_of_week' in df_work.columns:
        df_work['day_of_week'] = df_work['day_of_week'].str.lower().map(day_map)
    print("[Step 3] Temporal Encoding (Month/Day): Completed.")

    # Step 4: Pdays Transformation
    # (Using logic from transform_pdays)
    if 'pdays' in df_work.columns:
        df_work['pdays_group'] = df_work['pdays']
        # Convert to numeric temporarily for binning logic
        pdays_numeric = pd.to_numeric(df_work['pdays'], errors='coerce')
        mask = pdays_numeric != 999
        
        df_work.loc[~mask, 'pdays_group'] = 'not contacted'
        df_work.loc[mask, 'pdays_group'] = pd.cut(
            pdays_numeric[mask],
            bins=[-1, 3, 7, 14, 30],
            labels=['last 3 days', 'last week', 'last 2 weeks', 'last month']
        ).astype(str)
    print("[Step 4] Pdays Grouping Transformation: Completed.")

    print("\n=== Pipeline Execution Summary ===")
    print(f"Final Dataset Shape: {df_work.shape}")
    print(f"Columns processed: {list(df_work.columns)}")
    return df_work


