USE QuanLySanBong;
GO

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
        -- Dùng READ COMMITTED để tránh khóa toàn bảng gây Timeout
        BEGIN TRAN;

        -- Bước 1: Dọn dẹp các bản ghi đã hết hạn để giải phóng bộ nhớ
        DELETE FROM dbo.san_hold WHERE ExpiresAt <= @Now;

        -- Bước 2: Kiểm tra lịch thực tế (lich_dat_san)
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

        -- Bước 3: Kiểm tra các lượt đang giữ chỗ (san_hold)
        -- Sử dụng UPDLOCK, HOLDLOCK để đảm bảo không ai insert đè vào cùng lúc
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

        -- Bước 4: Insert lượt giữ chỗ mới
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

CREATE OR ALTER PROCEDURE dbo.USP_ConfirmBooking
    @HoldToken UNIQUEIDENTIFIER,
    @MaKh INT,
    @MaSan INT,
    @NguoiTaoPhieu NVARCHAR(50) = NULL,
    @NgayDat DATE,
    @GioBatDau TIME(0),
    @GioKetThuc TIME(0),
    @HinhThuc NVARCHAR(20),
    @TongTien DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRAN;

        -- 1. Kiểm tra Token giữ chỗ còn hiệu lực không
        IF NOT EXISTS (
            SELECT 1 FROM dbo.san_hold WITH (UPDLOCK, ROWLOCK)
            WHERE HoldToken = @HoldToken AND ExpiresAt > SYSUTCDATETIME()
        )
        BEGIN
            ROLLBACK;
            SELECT 0 AS success, N'Phiên giữ chỗ đã hết hạn.' AS message;
            RETURN;
        END

        -- 2. Kiểm tra giới hạn 2 phiếu/ngày/khách
        IF (SELECT COUNT(*) FROM dbo.phieu_dat_san WHERE ma_kh = @MaKh AND ngay_dat = @NgayDat AND trang_thai <> 'da_huy') >= 2
        BEGIN
            ROLLBACK;
            SELECT 0 AS success, N'Bạn đã đạt giới hạn 2 lượt đặt/ngày.' AS message;
            RETURN;
        END

        -- 3. Tạo mã phiếu mới (Dùng IDENTITY sẽ tốt hơn, nhưng đây là logic MAX+1 của bạn)
        DECLARE @MaPhieu INT;
        SELECT @MaPhieu = ISNULL(MAX(ma_phieu), 0) + 1 FROM dbo.phieu_dat_san WITH (UPDLOCK, HOLDLOCK);

        -- 4. Insert Phiếu và Lịch
        INSERT INTO dbo.phieu_dat_san(ma_phieu, ma_kh, ma_san, nguoi_tao_phieu, ngay_tao_phieu, ngay_dat, gio_bat_dau, gio_ket_thuc, hinh_thuc, trang_thai, tong_tien, tinh_trang_tt)
        VALUES (@MaPhieu, @MaKh, @MaSan, @NguoiTaoPhieu, GETDATE(), @NgayDat, @GioBatDau, @GioKetThuc, @HinhThuc, 'cho_xac_nhan', @TongTien, 'chua_tt');

        INSERT INTO dbo.lich_dat_san(ma_san, ma_phieu, ngay, gio_bat_dau, gio_ket_thuc)
        VALUES (@MaSan, @MaPhieu, @NgayDat, @GioBatDau, @GioKetThuc);

        -- 5. Xóa Hold sau khi đã xác nhận thành công
        DELETE FROM dbo.san_hold WHERE HoldToken = @HoldToken;

        COMMIT;
        SELECT 1 AS success, N'Đặt sân thành công' AS message, @MaPhieu AS ma_phieu;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        SELECT 0 AS success, ERROR_MESSAGE() AS message;
    END CATCH
END
GO

