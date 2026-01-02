-- Định nghĩa kiểu bảng cho danh sách mã ưu đãi
CREATE TYPE ListMaUuDai AS TABLE
(
    ma_uu_dai INT
);
GO

CREATE OR ALTER PROCEDURE sp_TaoHoaDon
    @MaPhieu INT,
    @DanhSachMaUuDai ListMaUuDai READONLY,
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
        
        -- Tính tổng giảm giá từ các ưu đãi
        DECLARE @MaUuDai INT;
        DECLARE @PhanTramGiam DECIMAL(5,2);
        DECLARE @DoiTuongApDung NVARCHAR(50);
        DECLARE @HangThanhVienUD NVARCHAR(50);
        DECLARE @MaLoaiUD INT;
        DECLARE @HoatDong BIT;
        DECLARE @NgayBD DATETIME;
        DECLARE @NgayKT DATETIME;
        DECLARE @GiamGia DECIMAL(18,2);
        
        -- Duyệt qua danh sách ưu đãi
        DECLARE uudai_cursor CURSOR FOR 
            SELECT ma_uu_dai FROM @DanhSachMaUuDai;
        
        OPEN uudai_cursor;
        FETCH NEXT FROM uudai_cursor INTO @MaUuDai;
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Lấy thông tin ưu đãi
            SELECT 
                @PhanTramGiam = phan_tram_giam,
                @DoiTuongApDung = doi_tuong_ap_dung,
                @HangThanhVienUD = hang_thanh_vien,
                @MaLoaiUD = ma_loai,
                @HoatDong = hoat_dong,
                @NgayBD = ngay_bd,
                @NgayKT = ngay_kt
            FROM uu_dai
            WHERE ma_uu_dai = @MaUuDai;
            
            -- Kiểm tra ưu đãi có hợp lệ không
            IF @HoatDong = 1 
               AND GETDATE() BETWEEN @NgayBD AND @NgayKT
            BEGIN
                -- Kiểm tra điều kiện áp dụng
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
                    SET @GiamGia = (@TongTienGoc * @PhanTramGiam) / 100.0;
                    SET @TongGiamGia = @TongGiamGia + @GiamGia;
                END
            END
            
            FETCH NEXT FROM uudai_cursor INTO @MaUuDai;
        END
        
        CLOSE uudai_cursor;
        DEALLOCATE uudai_cursor;
        
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