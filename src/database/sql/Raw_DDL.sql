IF OBJECT_ID('Raw.Bank','U') IS NOT NULL
BEGIN
    DROP TABLE Raw.Bank;
END;

CREATE TABLE Raw.Bank(
    age NVARCHAR(100),
    job NVARCHAR(100),
    marital NVARCHAR(100),
    education NVARCHAR(100),
    [default] NVARCHAR(100),
    housing NVARCHAR(100),
    loan NVARCHAR(100),
    contact NVARCHAR(100),
    month NVARCHAR(100),
    day_of_week NVARCHAR(100),
    duration NVARCHAR(100),
    campaign NVARCHAR(100),
    pdays NVARCHAR(100),
    previous NVARCHAR(100),
    poutcome NVARCHAR(100),
    [emp.var.rate] NVARCHAR(100),
    [cons.price.idx] NVARCHAR(100),
    [cons.conf.idx] NVARCHAR(100),
    euribor3m NVARCHAR(100),
    [nr.employed] NVARCHAR(100),
    y NVARCHAR(100)
);