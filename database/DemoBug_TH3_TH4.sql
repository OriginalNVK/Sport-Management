IF OBJECT_ID('dbo.USP_HoldSan', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_HoldSan;
GO

IF OBJECT_ID('dbo.USP_ReleaseHold', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_ReleaseHold;
GO

IF OBJECT_ID('dbo.USP_ConfirmBooking', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_ConfirmBooking;
GO

IF OBJECT_ID('dbo.USP_UpdateSanStatus', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_UpdateSanStatus;
GO

IF OBJECT_ID('dbo.san_hold', 'U') IS NOT NULL
    DROP TABLE dbo.san_hold;
GO
