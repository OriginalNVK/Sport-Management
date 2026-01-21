-- =====================================================
-- Stored Procedure Tạo Hóa Đơn - Nhận 1 mã ưu đãi duy nhất
-- =====================================================

CREATE OR ALTER PROCEDURE sp_TaoHoaDon
    @MaPhieu INT,
    @MaGiamGia NVARCHAR(50) = NULL,  -- Mã giảm giá (VD: "SLV5") - CÓ THỂ NULL
    @PhanTramThue DECIMAL(5,2) = 10.0  -- Thuế 10%
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Biến tính toán
        DECLARE @TongTienGoc DECIMAL(18,2) = 0;
        DECLARE @TongGiamGia DECIMAL(18,2) = 0;
        DECLARE @Thue DECIMAL(18,2) = 0;
        DECLARE @TongCuoi DECIMAL(18,2) = 0;
        DECLARE @MaKH INT;
        DECLARE @HangThanhVien NVARCHAR(50);
        DECLARE @MaSan INT;
        DECLARE @MaLoai INT;
        
        -- Lấy thông tin phiếu đặt sân
        SELECT 
            @TongTienGoc = pds.tong_tien,
            @MaKH = pds.ma_kh,
            @MaSan = pds.ma_san
        FROM phieu_dat_san pds
        WHERE pds.ma_phieu = @MaPhieu;
        
        -- Kiểm tra phiếu có tồn tại không
        IF @TongTienGoc IS NULL
        BEGIN
            RAISERROR(N'Không tìm thấy phiếu đặt sân với mã: %d', 16, 1, @MaPhieu);
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Kiểm tra phiếu đã có hóa đơn chưa
        IF EXISTS (SELECT 1 FROM hoa_don WHERE ma_phieu = @MaPhieu)
        BEGIN
            RAISERROR(N'Phiếu đặt sân với mã %d đã có hóa đơn', 16, 1, @MaPhieu);
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Lấy hạng thành viên của khách hàng
        SELECT @HangThanhVien = hang_thanh_vien
        FROM khach_hang
        WHERE ma_kh = @MaKH;
        
        -- Lấy loại sân
        SELECT @MaLoai = ma_loai
        FROM san
        WHERE ma_san = @MaSan;
        
        -- Tính giảm giá (nếu có mã giảm giá)
        IF @MaGiamGia IS NOT NULL AND LTRIM(RTRIM(@MaGiamGia)) <> ''
        BEGIN
            DECLARE @PhanTramGiam DECIMAL(5,2);
            DECLARE @DoiTuongApDung NVARCHAR(50);
            DECLARE @HangThanhVienUD NVARCHAR(50);
            DECLARE @MaLoaiUD INT;
            DECLARE @HoatDong BIT;
            DECLARE @NgayBD DATETIME;
            DECLARE @NgayKT DATETIME;
            
            -- Lấy thông tin ưu đãi dựa trên mã giảm giá
            SELECT 
                @PhanTramGiam = phan_tram_giam,
                @DoiTuongApDung = doi_tuong_ap_dung,
                @HangThanhVienUD = hang_thanh_vien,
                @MaLoaiUD = ma_loai,
                @HoatDong = hoat_dong,
                @NgayBD = ngay_bd,
                @NgayKT = ngay_kt
            FROM uu_dai
            WHERE ma_giam_gia = @MaGiamGia;
            
            -- Kiểm tra ưu đãi có hợp lệ không
            IF @HoatDong = 1 AND GETDATE() BETWEEN @NgayBD AND @NgayKT
            BEGIN
                DECLARE @ApDung BIT = 0;
                
                -- Kiểm tra loại sân
                IF @MaLoaiUD IS NULL OR @MaLoaiUD = @MaLoai
                BEGIN
                    -- Kiểm tra đối tượng áp dụng
                    IF @DoiTuongApDung = N'tat_ca'
                        SET @ApDung = 1;
                    ELSE IF @DoiTuongApDung = N'thanh_vien' 
                        AND (@HangThanhVienUD IS NULL OR @HangThanhVienUD = @HangThanhVien)
                        SET @ApDung = 1;
                END
                
                -- Tính giảm giá nếu được áp dụng
                IF @ApDung = 1
                BEGIN
                    SET @TongGiamGia = (@TongTienGoc * @PhanTramGiam) / 100.0;
                END
            END
        END
        
        -- Tính thuế và tổng cuối
        DECLARE @TongSauGiam DECIMAL(18,2) = @TongTienGoc - @TongGiamGia;
        SET @Thue = (@TongSauGiam * @PhanTramThue) / 100.0;
        SET @TongCuoi = @TongSauGiam + @Thue;
        
        -- Tạo mã hóa đơn
        DECLARE @MaHD INT;
        SELECT @MaHD = ISNULL(MAX(ma_hd), 0) + 1 FROM hoa_don;
        
        -- Thêm hóa đơn vào bảng
        INSERT INTO hoa_don (ma_hd, ma_phieu, ngay_lap, tong_tien, thue, giam_gia, tong_cuoi)
        VALUES (@MaHD, @MaPhieu, GETDATE(), @TongTienGoc, @Thue, @TongGiamGia, @TongCuoi);
        
        -- Trả về kết quả
        SELECT 
            hd.ma_hd,
            hd.ma_phieu,
            hd.ngay_lap,
            hd.tong_tien,
            hd.giam_gia,
            hd.thue,
            hd.tong_cuoi,
            kh.ho_ten AS ten_khach_hang,
            kh.hang_thanh_vien
        FROM hoa_don hd
        INNER JOIN phieu_dat_san pds ON hd.ma_phieu = pds.ma_phieu
        INNER JOIN khach_hang kh ON pds.ma_kh = kh.ma_kh
        WHERE hd.ma_hd = @MaHD;
        
        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

USE QuanLySanBong;
GO

-- =====================================================
CREATE OR ALTER PROCEDURE sp_GetMyBookingsUnPaid
    @MaKh INT = NULL,
    @MaNv INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT 
            pds.ma_phieu AS MaPhieu,
            pds.ngay_dat AS NgayDat,
            pds.gio_bat_dau AS GioBatDau,
            pds.gio_ket_thuc AS GioKetThuc,
            pds.trang_thai AS TrangThai,
            pds.tong_tien AS TongTien,
            pds.tinh_trang_tt AS TinhTrangTt,
            
            -- Thông tin hóa đơn
            hd.ma_hd AS MaHoaDon,
            
            -- Thông tin loại sân
            ls.ma_loai AS MaLoai,
            s.ten_san AS TenSan,
            
            -- Thông tin dịch vụ
            STUFF((
                SELECT ', ' + dv.ten_dv + ' x' + CAST(ct.so_luong AS NVARCHAR(10)) + ' ' + dv.don_vi
                FROM chi_tiet_dv ct
                INNER JOIN dich_vu dv ON ct.ma_dv = dv.ma_dv
                WHERE ct.ma_phieu = pds.ma_phieu
                FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS DanhSachDichVu
            
        FROM phieu_dat_san pds
        INNER JOIN san s ON pds.ma_san = s.ma_san
        INNER JOIN loai_san ls ON s.ma_loai = ls.ma_loai
        LEFT JOIN hoa_don hd ON pds.ma_phieu = hd.ma_phieu
        
        WHERE 
            pds.tinh_trang_tt = 'chua_tt'
            AND (
                (@MaKh IS NOT NULL AND pds.ma_kh = @MaKh)
                OR (@MaNv IS NOT NULL AND pds.nguoi_tao_phieu IS NOT NULL)
            )
            
        ORDER BY pds.ngay_tao_phieu DESC;
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

-- =====================================================
-- Stored procedure để lấy tất cả bookings (for admin)
-- =====================================================
CREATE OR ALTER PROCEDURE sp_GetAllBookings
    @TinhTrangTt NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT 
            pds.ma_phieu AS MaPhieu,
            pds.ngay_dat AS NgayDat,
            pds.gio_bat_dau AS GioBatDau,
            pds.gio_ket_thuc AS GioKetThuc,
            pds.trang_thai AS TrangThai,
            pds.tong_tien AS TongTien,
            pds.tinh_trang_tt AS TinhTrangTt,
            
            -- Thông tin hóa đơn
            hd.ma_hd AS MaHoaDon,
            
            -- Thông tin loại sân
            ls.ma_loai AS MaLoai,
            ls.ten_loai AS TenLoai,
            s.ten_san AS TenSan,
            
            -- Thông tin khách hàng
            kh.ho_ten AS TenKhachHang,
            
            -- Thông tin dịch vụ
            STUFF((
                SELECT ', ' + dv.ten_dv + ' x' + CAST(ct.so_luong AS NVARCHAR(10)) + ' ' + dv.don_vi
                FROM chi_tiet_dv ct
                INNER JOIN dich_vu dv ON ct.ma_dv = dv.ma_dv
                WHERE ct.ma_phieu = pds.ma_phieu
                FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS DanhSachDichVu
            
        FROM phieu_dat_san pds
        INNER JOIN san s ON pds.ma_san = s.ma_san
        INNER JOIN loai_san ls ON s.ma_loai = ls.ma_loai
        INNER JOIN khach_hang kh ON pds.ma_kh = kh.ma_kh
        LEFT JOIN hoa_don hd ON pds.ma_phieu = hd.ma_phieu
        
        WHERE 
            (@TinhTrangTt IS NULL OR pds.tinh_trang_tt = @TinhTrangTt)
            AND pds.trang_thai = N'da_xac_nhan'  -- Chỉ lấy booking đã xác nhận
            AND pds.ma_phieu NOT IN (SELECT ma_phieu FROM hoa_don)  -- Chỉ lấy booking chưa có hóa đơn
            
        ORDER BY pds.ngay_tao_phieu DESC;
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO
-- =====================================================
-- Stored procedure cập nhật hóa đơn với READ COMMITTED
-- Giải quyết vấn đề DIRTY READ
-- =====================================================
CREATE OR ALTER PROCEDURE sp_CapNhatHoaDon
    @MaHd INT,
    @MaGiamGia NVARCHAR(50) = NULL,
    @TestRollback BIT = 0  -- Parameter để demo ROLLBACK (dirty read)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Comment dòng này để demo dirty read
    SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @MaPhieu INT;
        DECLARE @TongTienGoc DECIMAL(18,2);
        DECLARE @GiamGiaMoi DECIMAL(18,2) = 0;
        DECLARE @Thue DECIMAL(18,2);
        DECLARE @TongCuoi DECIMAL(18,2);
        
        -- Đọc thông tin hóa đơn hiện tại
        -- Comment UPDLOCK để T2 có thể đọc uncommitted data
        SELECT 
            @MaPhieu = hd.ma_phieu,
            @TongTienGoc = hd.tong_tien,
            @Thue = hd.thue
        FROM hoa_don hd WITH (UPDLOCK)
        WHERE hd.ma_hd = @MaHd;
        
        IF @MaPhieu IS NULL
        BEGIN
            RAISERROR(N'Không tìm thấy hóa đơn với mã: %d', 16, 1, @MaHd);
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Tính giảm giá mới nếu có mã giảm giá
        IF @MaGiamGia IS NOT NULL AND LTRIM(RTRIM(@MaGiamGia)) <> ''
        BEGIN
            DECLARE @PhanTramGiam DECIMAL(5,2);
            DECLARE @HoatDong BIT;
            DECLARE @NgayBD DATETIME;
            DECLARE @NgayKT DATETIME;
            
            -- Lấy thông tin mã giảm giá theo mã giảm giá
            SELECT 
                @PhanTramGiam = phan_tram_giam,
                @HoatDong = hoat_dong,
                @NgayBD = ngay_bd,
                @NgayKT = ngay_kt
            FROM uu_dai
            WHERE ma_giam_gia = @MaGiamGia;
            
            -- Kiểm tra mã giảm giá hợp lệ
            IF @HoatDong = 1 AND GETDATE() BETWEEN @NgayBD AND @NgayKT
            BEGIN
                SET @GiamGiaMoi = (@TongTienGoc * @PhanTramGiam) / 100.0;
            END
        END
        
        -- Tính lại tổng cuối
        DECLARE @TongSauGiam DECIMAL(18,2) = @TongTienGoc - @GiamGiaMoi;
        SET @Thue = (@TongSauGiam * 10.0) / 100.0;  -- Thuế 10%
        SET @TongCuoi = @TongSauGiam + @Thue;
        
        -- Cập nhật hóa đơn (data vẫn uncommitted)
        UPDATE hoa_don
        SET 
            giam_gia = @GiamGiaMoi,
            thue = @Thue,
            tong_cuoi = @TongCuoi
        WHERE ma_hd = @MaHd;

        PRINT 'Đã UPDATE hóa đơn (uncommitted). Đang đợi 10 giây...';
        
        -- Delay để T2 có thời gian đọc uncommitted data
        WAITFOR DELAY '00:00:10';
        
        -- Kiểm tra xem có test rollback không
        IF @TestRollback = 1
        BEGIN
            PRINT 'ROLLBACK: Phát hiện lỗi, đang rollback transaction...';
            ROLLBACK TRANSACTION;
            PRINT 'ROLLBACK thành công! Dữ liệu đã quay về ban đầu.';
		SELECT 
            ma_hd,
            ma_phieu,
            tong_tien,
            giam_gia,
            thue,
            tong_cuoi
        FROM hoa_don
        WHERE ma_hd = @MaHd;
			RETURN
        END
        
        -- Đọc lại từ database SAU KHI COMMIT để trả về frontend
        -- Chỉ trả về response khi commit thành công
        SELECT 
            ma_hd,
            ma_phieu,
            tong_tien,
            giam_gia,
            thue,
            tong_cuoi
        FROM hoa_don
        WHERE ma_hd = @MaHd;
        
        PRINT 'Đang COMMIT transaction...';
        COMMIT TRANSACTION;
        PRINT 'COMMIT thành công! Dữ liệu đã được lưu vào DB.';

        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO;

-- =====================================================
-- Stored procedure đọc hóa đơn với REPEATABLE READ
-- Giải quyết vấn đề UNREPEATABLE READ
-- =====================================================
CREATE OR ALTER PROCEDURE sp_XemThongTinHoaDon
    @MaHd INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Set isolation level để tránh Unrepeatable Read
    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Shared Lock được acquire ở đây và giữ cho đến COMMIT
        -- Ngăn session khác UPDATE data này trong khi đang đọc
        SELECT 
            hd.ma_hd,
            hd.ma_phieu,
            hd.ngay_lap,
            hd.tong_tien,
            hd.giam_gia,
            hd.thue,
            hd.tong_cuoi,
            pds.tinh_trang_tt,
            kh.ho_ten AS ten_khach_hang,
            s.ten_san
        FROM hoa_don hd
        INNER JOIN phieu_dat_san pds ON hd.ma_phieu = pds.ma_phieu
        INNER JOIN khach_hang kh ON pds.ma_kh = kh.ma_kh
        INNER JOIN san s ON pds.ma_san = s.ma_san
        WHERE hd.ma_hd = @MaHd;

        -- WAITFOR DELAY '00:00:30';
        
        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO
