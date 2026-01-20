IF OBJECT_ID('dbo.san_hold', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.san_hold
    (
        HoldToken     UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        MaSan         INT NOT NULL,
        NgayDat       DATE NOT NULL,
        GioBatDau     TIME(0) NOT NULL,
        GioKetThuc    TIME(0) NOT NULL,
        Owner         NVARCHAR(50) NULL, 
        CreatedAt     DATETIME2 NOT NULL CONSTRAINT DF_SAN_HOLD_CreatedAt DEFAULT SYSUTCDATETIME(),
        ExpiresAt     DATETIME2 NOT NULL
    );

    CREATE INDEX IX_SAN_HOLD_Lookup 
    ON dbo.san_hold(MaSan, NgayDat) 
    INCLUDE (GioBatDau, GioKetThuc, ExpiresAt);
END

GO 

CREATE OR ALTER PROCEDURE dbo.USP_HoldSan
    @MaSan INT,
    @NgayDat DATE,
    @GioBatDau TIME(0),
    @GioKetThuc TIME(0),
    @Owner NVARCHAR(50) = NULL,
    @HoldSeconds INT = 60
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @Now DATETIME2 = SYSUTCDATETIME();
    DECLARE @Expires DATETIME2 = DATEADD(SECOND, @HoldSeconds, @Now);
    DECLARE @Token UNIQUEIDENTIFIER = NEWID();

    BEGIN TRY
        BEGIN TRAN;

        DELETE FROM dbo.san_hold WHERE ExpiresAt <= @Now;

        IF EXISTS (
            SELECT 1 FROM dbo.lich_dat_san WITH (NOLOCK)
            WHERE ma_san = @MaSan AND ngay = @NgayDat
              AND @GioBatDau < gio_ket_thuc AND @GioKetThuc > gio_bat_dau
        )
        BEGIN
            ROLLBACK;
            SELECT 0 AS success, N'Sân đã có lịch đặt cố định.' AS message;
            RETURN;
        END

        IF EXISTS (
            SELECT 1 FROM dbo.san_hold WITH (UPDLOCK, HOLDLOCK)
            WHERE MaSan = @MaSan AND NgayDat = @NgayDat
              AND ExpiresAt > @Now
              AND @GioBatDau < GioKetThuc AND @GioKetThuc > GioBatDau
        )
        BEGIN
            ROLLBACK;
            SELECT 0 AS success, N'Sân đang có người giữ chỗ, vui lòng đợi.' AS message;
            RETURN;
        END

        INSERT INTO dbo.san_hold(HoldToken, MaSan, NgayDat, GioBatDau, GioKetThuc, Owner, ExpiresAt)
        VALUES (@Token, @MaSan, @NgayDat, @GioBatDau, @GioKetThuc, @Owner, @Expires);

        COMMIT;

        SELECT 1 AS success, N'Giữ chỗ thành công' AS message, @Token AS holdToken, @Expires AS expiresAt;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        SELECT 0 AS success, ERROR_MESSAGE() AS message;
    END CATCH
END
GO


CREATE OR ALTER PROCEDURE dbo.USP_ReleaseHold
    @HoldToken UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DELETE dbo.san_hold WHERE HoldToken = @HoldToken;

    SELECT 1 AS success, N'Đã nhả giữ chỗ' AS message;
END
GO

CREATE OR ALTER PROCEDURE dbo.USP_UpdateSanStatus
  @MaSan INT,
  @TinhTrang NVARCHAR(50)
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (
      SELECT 1
      FROM dbo.san_hold
      WHERE MaSan = @MaSan
        AND ExpiresAt > SYSUTCDATETIME()
  )
  BEGIN
      RAISERROR(N'Sân đang được giữ chỗ, không thể cập nhật trạng thái lúc này.', 16, 1);
      RETURN;
  END

  UPDATE dbo.san
  SET tinh_trang = @TinhTrang
  WHERE ma_san = @MaSan;

  SELECT 1 AS success, N'Cập nhật trạng thái thành công' AS message;
END
GO

