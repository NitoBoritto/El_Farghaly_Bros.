

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Raw')
BEGIN
    EXEC('CREATE SCHEMA Raw');
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Transformed')
BEGIN
    EXEC('CREATE SCHEMA Transformed');
END;
GO