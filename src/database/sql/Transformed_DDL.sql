
IF OBJECT_ID('Transformed.Bank', 'U') IS NOT NULL
BEGIN
    DROP TABLE Transformed.Bank;
END;
GO


CREATE TABLE Transformed.Bank (
    age INT,
    job NVARCHAR(50),
    marital NVARCHAR(20),
    education NVARCHAR(50),
    [default] NVARCHAR(10),
    housing NVARCHAR(10),
    loan NVARCHAR(10),
    contact NVARCHAR(20),
    month INT,
    day_of_week INT,
    duration INT,
    campaign INT,
    pdays INT,
    previous INT,
    poutcome NVARCHAR(20),
    [emp.var.rate] FLOAT,
    [cons.price.idx] FLOAT,
    [cons.conf.idx] FLOAT,
    euribor3m FLOAT,
    [nr.employed] FLOAT,
    y NVARCHAR(10)
);
GO