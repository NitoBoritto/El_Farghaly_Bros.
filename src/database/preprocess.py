import pandas as pd
from src.app.schemas import bankingdata


def _get_schema_type_mapping():
    """Build a dataframe-column to python-type map from pydantic schema fields."""
    mapping = {}
    for field_name, field_info in bankingdata.model_fields.items():
        expected_type = field_info.annotation
        mapping[field_name] = expected_type
        if field_info.alias:
            mapping[field_info.alias] = expected_type

    # ETL-only validation for the target column, which is not part of inference requests.
    mapping['y'] = str

    # ETL decision: keep integer encoding for temporal columns in transformed table.
    mapping['month'] = int
    mapping['day_of_week'] = int
    return mapping


def _coerce_dataframe_to_schema_dtypes(df_input):
    """Coerce dataframe dtypes to the schema contract where columns are present."""
    schema_types = _get_schema_type_mapping()
    df_output = df_input.copy()

    coerced_columns = []
    conversion_losses = []

    for column_name, expected_type in schema_types.items():
        if column_name not in df_output.columns:
            continue

        before_nulls = df_output[column_name].isna().sum()

        if expected_type is int:
            df_output[column_name] = pd.to_numeric(df_output[column_name], errors='coerce').astype('Int64')
        elif expected_type is float:
            df_output[column_name] = pd.to_numeric(df_output[column_name], errors='coerce').astype('float64')
        elif expected_type is str:
            df_output[column_name] = df_output[column_name].astype('string')

        after_nulls = df_output[column_name].isna().sum()
        coerced_columns.append(column_name)
        if after_nulls > before_nulls:
            conversion_losses.append(f"{column_name}: +{after_nulls - before_nulls} nulls")

    missing_schema_columns = sorted(set(schema_types.keys()) - set(df_output.columns))

    print(f"[Step 5] Dtype Validation/Coercion: Completed for {len(coerced_columns)} columns.")
    if missing_schema_columns:
        print(f"[Step 5] Schema columns not present in dataframe: {missing_schema_columns}")
    if conversion_losses:
        print(f"[Step 5] Conversion warnings: {conversion_losses}")

    return df_output


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

    # Step 5: Validate/coerce dtypes against application schema contract.
    df_work = _coerce_dataframe_to_schema_dtypes(df_work)
    dtype_snapshot = {col: str(df_work[col].dtype) for col in ['month', 'day_of_week'] if col in df_work.columns}
    if dtype_snapshot:
        print(f"[Step 5] Temporal dtype check: {dtype_snapshot}")

    print("\n=== Pipeline Execution Summary ===")
    print(f"Final Dataset Shape: {df_work.shape}")
    print(f"Columns processed: {list(df_work.columns)}")
    return df_work


def build_dashboard_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Generate analytical features for dashboard consumption.

    Parameters
    ----------
    df : pd.DataFrame
        Output of process_data_pipeline() — already cleaned and
        transformed. Must contain the columns produced by that
        pipeline (month as int 1-12, day_of_week as int 1-5,
        pdays_group, and all economic / behavioural columns).

    Returns
    -------
    pd.DataFrame
        New dataframe with every original column preserved plus
        the engineered dashboard features appended on the right.
    """
    out = df.copy()

    required_columns = [
        "month", "day_of_week", "emp.var.rate", "cons.price.idx",
        "cons.conf.idx", "euribor3m", "nr.employed", "campaign",
        "previous", "poutcome", "pdays_group", "age", "housing",
        "loan", "default"
    ]
    missing_columns = [col for col in required_columns if col not in out.columns]
    if missing_columns:
        raise ValueError(
            f"build_dashboard_features requires the following missing columns: {missing_columns}"
        )

    numeric_columns = [
        "emp.var.rate", "cons.price.idx", "cons.conf.idx", "euribor3m",
        "nr.employed", "campaign", "previous", "age"
    ]
    for column_name in numeric_columns:
        out[column_name] = pd.to_numeric(out[column_name], errors="coerce")

    # ============================================================
    # SECTION 1 — DATE & TIME INTELLIGENCE
    # ============================================================

    quarter_map = {
        1: 1, 2: 1, 3: 1,
        4: 2, 5: 2, 6: 2,
        7: 3, 8: 3, 9: 3,
        10: 4, 11: 4, 12: 4,
    }
    out["quarter"] = out["month"].map(quarter_map)

    season_map = {
        12: "winter", 1: "winter",  2: "winter",
        3:  "spring", 4: "spring",  5: "spring",
        6:  "summer", 7: "summer",  8: "summer",
        9:  "autumn", 10: "autumn", 11: "autumn",
    }
    out["season"] = out["month"].map(season_map)

    week_pos_map = {1: "start", 2: "mid", 3: "mid", 4: "end", 5: "end"}
    out["week_position"] = out["day_of_week"].map(week_pos_map)

    out["campaign_timing_score"] = (
        out["day_of_week"].isin([2, 3]).astype(int)
        + (out["quarter"] == 4).astype(int)
        + (out["season"] == "summer").astype(int)
        + (out["quarter"] == 2).astype(int)
    )

    # ============================================================
    # SECTION 2 — ECONOMIC INTELLIGENCE
    # ============================================================

    def minmax(series: pd.Series) -> pd.Series:
        lo, hi = series.min(), series.max()
        return (series - lo) / (hi - lo + 1e-9)

    emp_n = minmax(out["emp.var.rate"])
    cpi_n = minmax(out["cons.price.idx"])
    conf_n = minmax(out["cons.conf.idx"])
    euri_n = minmax(out["euribor3m"])
    emp_tot = minmax(out["nr.employed"])

    out["economic_pressure_index"] = (
        (euri_n * 0.40)
        + (cpi_n * 0.35)
        + ((1 - emp_tot) * 0.25)
    ).round(4)

    out["consumer_sentiment_score"] = (
        (conf_n * 0.60)
        + ((1 - cpi_n) * 0.40)
    ).round(4)

    out["interest_rate_impact"] = euri_n.round(4)

    out["employment_health_indicator"] = (
        (emp_tot * 0.60)
        + (emp_n * 0.40)
    ).round(4)

    out["macro_environment_score"] = (
        out["consumer_sentiment_score"] * 0.35
        + out["employment_health_indicator"] * 0.35
        + (1 - out["economic_pressure_index"]) * 0.30
    ).round(4)

    out["macro_environment_label"] = pd.cut(
        out["macro_environment_score"],
        bins=[0, 0.35, 0.55, 0.75, 1.01],
        labels=["stressed", "weak", "stable", "favourable"],
        right=False,
    )

    # ============================================================
    # SECTION 3 — CUSTOMER BEHAVIOUR FEATURES
    # ============================================================

    out["contact_intensity"] = (out["campaign"] / (out["previous"] + 1)).round(4)
    out["previous_success_flag"] = (out["poutcome"] == "success").astype(int)

    recency_map = {
        "not contacted": 0,
        "last month": 1,
        "last 2 weeks": 2,
        "last week": 3,
        "last 3 days": 4,
    }
    out["recency_score"] = out["pdays_group"].map(recency_map).fillna(0).astype(int)

    out["engagement_score"] = (
        out["recency_score"]
        + out["previous_success_flag"] * 3
        + (out["campaign"] <= 2).astype(int) * 2
        + (out["previous"] > 0).astype(int)
    ).clip(0, 10)

    total_contacts = out["campaign"] + out["previous"]
    out["customer_activity_level"] = pd.cut(
        total_contacts,
        bins=[-1, 1, 3, 6, 9999],
        labels=["low", "moderate", "high", "very_high"],
    )

    # ============================================================
    # SECTION 4 — SMART BUSINESS FEATURES
    # ============================================================

    out["age_segment"] = pd.cut(
        out["age"],
        bins=[0, 35, 55, 120],
        labels=["young", "adult", "senior"],
        right=True,
    )

    housing_flag = (out["housing"] == "yes").astype(int)
    loan_flag = (out["loan"] == "yes").astype(int)
    out["financial_commitment_level"] = (housing_flag + loan_flag)

    high_default = out["default"].isin(["yes", "unknown"])
    both_loans = out["financial_commitment_level"] == 2
    customer_risk_flag = (high_default | both_loans).astype(int)

    out["customer_risk_label"] = customer_risk_flag.map(
        {0: "low_risk", 1: "elevated_risk"}
    )

    return out


