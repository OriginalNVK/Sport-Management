-- =============================================
-- 1. Procedure ĐỌC danh sách đơn nghỉ phép (CÓ LỖI PHANTOM READ)
-- Quản lý sử dụng procedure này để đọc danh sách
-- Sẽ bị phantom read nếu có nhân viên thêm đơn mới
-- =============================================
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
    
    -- Giả lập thời gian đọc/xử lý dữ liệu (10 giây)
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

-- =============================================
-- 2. Procedure THÊM đơn nghỉ phép (NORMAL - không có delay)
-- Nhân viên sử dụng procedure này để tạo đơn
-- =============================================
CREATE OR ALTER PROCEDURE sp_CreateLeaveRequest_Normal
    @MaNv INT,
    @NgayNghi DATE,
    @LyDo NVARCHAR(1000),
    @MaDonOutput INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Kiểm tra nhân viên có tồn tại không
        IF NOT EXISTS (SELECT 1 FROM nhan_vien WHERE ma_nv = @MaNv)
        BEGIN
            RAISERROR(N'Nhân viên không tồn tại', 16, 1);
            RETURN;
        END
        
        -- Kiểm tra ngày nghỉ phải từ hôm nay trở đi
        IF @NgayNghi < CAST(GETDATE() AS DATE)
        BEGIN
            RAISERROR(N'Ngày nghỉ phải từ hôm nay trở đi', 16, 1);
            RETURN;
        END
        
        -- Thêm đơn nghỉ phép mới
        INSERT INTO don_nghi_phep (ma_nv, ngay_nghi, ly_do, trang_thai)
        VALUES (@MaNv, @NgayNghi, @LyDo, 'cho_duyet');
        
        -- Lấy mã đơn vừa tạo
        SET @MaDonOutput = SCOPE_IDENTITY();
        
        SELECT 
            @MaDonOutput AS MaDon,
            N'Tạo đơn nghỉ phép thành công' AS Message;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

-- =============================================
-- 3. Procedure ĐỌC danh sách đơn nghỉ phép (ĐÃ FIX PHANTOM READ)
-- Sử dụng SERIALIZABLE isolation level
-- =============================================
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
        
        -- Giả lập thời gian đọc/xử lý dữ liệu (10 giây)
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

-- =============================================
-- 4. Procedure THÊM đơn nghỉ phép (SẼ BỊ BLOCK khi procedure 3 đang chạy)
-- =============================================
CREATE OR ALTER PROCEDURE sp_CreateLeaveRequest_WillBeBlocked
    @MaNv INT,
    @NgayNghi DATE,
    @LyDo NVARCHAR(1000),
    @MaDonOutput INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Kiểm tra nhân viên có tồn tại không
        IF NOT EXISTS (SELECT 1 FROM nhan_vien WHERE ma_nv = @MaNv)
        BEGIN
            RAISERROR(N'Nhân viên không tồn tại', 16, 1);
            RETURN;
        END
        
        -- Kiểm tra ngày nghỉ phải từ hôm nay trở đi
        IF @NgayNghi < CAST(GETDATE() AS DATE)
        BEGIN
            RAISERROR(N'Ngày nghỉ phải từ hôm nay trở đi', 16, 1);
            RETURN;
        END
        
        -- Log trước khi insert
        PRINT N'[' + CONVERT(VARCHAR, GETDATE(), 121) + N'] Đang chờ để insert đơn nghỉ phép...';
        
        -- Thêm đơn nghỉ phép mới
        -- Sẽ bị BLOCK nếu có transaction khác đang giữ SERIALIZABLE lock
        INSERT INTO don_nghi_phep (ma_nv, ngay_nghi, ly_do, trang_thai)
        VALUES (@MaNv, @NgayNghi, @LyDo, 'cho_duyet');
        
        -- Lấy mã đơn vừa tạo
        SET @MaDonOutput = SCOPE_IDENTITY();
        
        -- Log sau khi insert thành công
        PRINT N'[' + CONVERT(VARCHAR, GETDATE(), 121) + N'] Insert thành công!';
        
        SELECT 
            @MaDonOutput AS MaDon,
            N'Tạo đơn nghỉ phép thành công (đã chờ transaction khác hoàn thành)' AS Message;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

-- =============================================
-- 5. Helper procedure để xem trạng thái lock
-- =============================================
CREATE OR ALTER PROCEDURE sp_ViewCurrentLocks
AS
BEGIN
    SELECT 
        l.request_session_id AS SessionID,
        DB_NAME(l.resource_database_id) AS DatabaseName,
        l.resource_type AS ResourceType,
        l.resource_associated_entity_id AS ResourceID,
        l.request_mode AS LockMode,
        l.request_status AS LockStatus,
        s.program_name AS ProgramName,
        s.host_name AS HostName,
        s.login_name AS LoginName,
        t.text AS LastCommand
    FROM sys.dm_tran_locks l
    LEFT JOIN sys.dm_exec_sessions s ON l.request_session_id = s.session_id
    LEFT JOIN sys.dm_exec_connections c ON s.session_id = c.session_id
    CROSS APPLY sys.dm_exec_sql_text(c.most_recent_sql_handle) t
    WHERE l.resource_database_id = DB_ID()
    ORDER BY l.request_session_id;
END;
GO

