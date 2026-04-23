IF OBJECT_ID('Transformed.Bank', 'U') IS NOT NULL
BEGIN
  
  
    TRUNCATE TABLE Transformed.Bank;

 
    INSERT INTO Transformed.Bank (
        age, job, marital, education, [default], housing, loan, contact, month, day_of_week, 
        duration, campaign, pdays, previous, poutcome, 
        [emp.var.rate], [cons.price.idx], [cons.conf.idx], euribor3m, [nr.employed], y
    )
    SELECT 
        CAST(age AS INT),
        job,
        marital,
        education,
        [default],
        housing,
        loan,
        contact,
        month,
        day_of_week,
        CAST(duration AS INT),
        CAST(campaign AS INT),
        CAST(pdays AS INT),
        CAST(previous AS INT),
        poutcome,
        CAST([emp.var.rate] AS FLOAT),
        CAST([cons.price.idx] AS FLOAT),
        CAST([cons.conf.idx] AS FLOAT),
        CAST(euribor3m AS FLOAT),
        CAST([nr.employed] AS FLOAT),
        y
    FROM Raw.Bank;
END
ELSE
BEGIN

    SELECT 
        CAST(age AS INT) AS age,
        job,
        marital,
        education,
        [default],
        housing,
        loan,
        contact,
        month,
        day_of_week,
        CAST(duration AS INT) AS duration,
        CAST(campaign AS INT) AS campaign,
        CAST(pdays AS INT) AS pdays,
        CAST(previous AS INT) AS previous,
        poutcome,
        CAST([emp.var.rate] AS FLOAT) AS [emp.var.rate],
        CAST([cons.price.idx] AS FLOAT) AS [cons.price.idx],
        CAST([cons.conf.idx] AS FLOAT) AS [cons.conf.idx],
        CAST(euribor3m AS FLOAT) AS euribor3m,
        CAST([nr.employed] AS FLOAT) AS [nr.employed],
        y
    INTO Transformed.Bank
    FROM Raw.Bank;
END;
GO