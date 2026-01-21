-- 1. Procedure ĐỌC danh sách đơn nghỉ phép (CÓ LỖI PHANTOM READ)
-- Quản lý sử dụng procedure này để đọc danh sách
-- Sẽ bị phantom read nếu có nhân viên thêm đơn mới

CREATE OR ALTER PROCEDURE sp_GetLeaveRequests_WithPhantomRead
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Không set isolation level -> mặc định là READ COMMITTED
    -- Sẽ bị phantom read
    
    -- Lần đọc đầu tiên
    SELECT 
        d.ma_don AS MaDon,
        d.ma_nv AS MaNv,
        nv.ho_ten AS TenNhanVien,
        nv.chuc_vu AS ChucVu,
        d.ngay_nghi AS NgayNghi,
        d.ly_do AS LyDo,
        d.trang_thai AS TrangThai,
        1 AS LanDoc -- Đánh dấu đây là lần đọc 1
    FROM don_nghi_phep d
    INNER JOIN nhan_vien nv ON d.ma_nv = nv.ma_nv
    WHERE d.trang_thai = 'cho_duyet'
    ORDER BY d.ngay_nghi DESC;
    
    -- Giả lập thời gian đọc/xử lý dữ liệu 
    WAITFOR DELAY '00:00:10';
    
    -- Lần đọc thứ hai - trong cùng transaction
    -- Nếu có nhân viên thêm đơn mới trong khoảng 10 giây này
    -- thì lần đọc này sẽ thấy đơn mới (PHANTOM READ)
    SELECT 
        d.ma_don AS MaDon,
        d.ma_nv AS MaNv,
        nv.ho_ten AS TenNhanVien,
        nv.chuc_vu AS ChucVu,
        d.ngay_nghi AS NgayNghi,
        d.ly_do AS LyDo,
        d.trang_thai AS TrangThai,
        2 AS LanDoc -- Đánh dấu đây là lần đọc 2
    FROM don_nghi_phep d
    INNER JOIN nhan_vien nv ON d.ma_nv = nv.ma_nv
    WHERE d.trang_thai = 'cho_duyet'
    ORDER BY d.ngay_nghi DESC;
END;
GO

-- 2. Procedure ĐỌC danh sách đơn nghỉ phép (ĐÃ FIX PHANTOM READ)
-- Sử dụng SERIALIZABLE isolation level

CREATE OR ALTER PROCEDURE sp_GetLeaveRequests_FixedPhantomRead
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Bắt đầu transaction với SERIALIZABLE isolation level
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Set isolation level để ngăn phantom read
        SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
        
        -- Lần đọc đầu tiên với HOLDLOCK
        -- HOLDLOCK giữ shared lock cho đến khi transaction kết thúc
        SELECT 
            d.ma_don AS MaDon,
            d.ma_nv AS MaNv,
            nv.ho_ten AS TenNhanVien,
            nv.chuc_vu AS ChucVu,
            d.ngay_nghi AS NgayNghi,
            d.ly_do AS LyDo,
            d.trang_thai AS TrangThai,
            1 AS LanDoc
        FROM don_nghi_phep d WITH (HOLDLOCK, SERIALIZABLE)
        INNER JOIN nhan_vien nv ON d.ma_nv = nv.ma_nv
        WHERE d.trang_thai = 'cho_duyet'
        ORDER BY d.ngay_nghi DESC;
        
        -- Giả lập thời gian đọc/xử lý dữ liệu 
        WAITFOR DELAY '00:00:10';
        
        -- Lần đọc thứ hai
        -- Sẽ KHÔNG bị phantom read vì đã lock range
        -- Các INSERT từ transaction khác sẽ bị chờ
        SELECT 
            d.ma_don AS MaDon,
            d.ma_nv AS MaNv,
            nv.ho_ten AS TenNhanVien,
            nv.chuc_vu AS ChucVu,
            d.ngay_nghi AS NgayNghi,
            d.ly_do AS LyDo,
            d.trang_thai AS TrangThai,
            2 AS LanDoc
        FROM don_nghi_phep d WITH (HOLDLOCK, SERIALIZABLE)
        INNER JOIN nhan_vien nv ON d.ma_nv = nv.ma_nv
        WHERE d.trang_thai = 'cho_duyet'
        ORDER BY d.ngay_nghi DESC;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO


-- 3. Procedure THÊM đơn nghỉ phép 

CREATE OR ALTER PROCEDURE sp_CreateLeaveRequest1
    @MaNv INT,
    @NgayNghi DATE,
    @LyDo NVARCHAR(1000),
    @MaDonOutput INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM nhan_vien WHERE ma_nv = @MaNv)
        BEGIN
            RAISERROR(N'Nhân viên không tồn tại', 16, 1);
            RETURN;
        END
        
        IF @NgayNghi < CAST(GETDATE() AS DATE)
        BEGIN
            RAISERROR(N'Ngày nghỉ phải từ hôm nay trở đi', 16, 1);
            RETURN;
        END
        
        PRINT N'[' + CONVERT(VARCHAR, GETDATE(), 121) + N'] Đang chờ để insert đơn nghỉ phép...';
        

        INSERT INTO don_nghi_phep (ma_nv, ngay_nghi, ly_do, trang_thai)
        VALUES (@MaNv, @NgayNghi, @LyDo, 'cho_duyet');
        
        SET @MaDonOutput = SCOPE_IDENTITY();
        
        PRINT N'[' + CONVERT(VARCHAR, GETDATE(), 121) + N'] Insert thành công!';
        
        SELECT 
            @MaDonOutput AS MaDon,
            N'Tạo đơn nghỉ phép thành công ' AS Message;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO



