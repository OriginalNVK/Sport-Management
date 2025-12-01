-- =============================================
-- TẠO DATABASE SPORTMANAGEMENT CHO SQL SERVER
-- =============================================

CREATE DATABASE SportManagement;
GO

USE SportManagement;
GO

-- 1. nhan_vien
CREATE TABLE nhan_vien (
    ma_nv INT PRIMARY KEY,
    ho_ten NVARCHAR(100) NOT NULL,
    ngay_sinh DATE,
    gioi_tinh NVARCHAR(10),
    cmnd_cccd VARCHAR(20),
    sdt VARCHAR(15),
    email VARCHAR(100),
    dia_chi NVARCHAR(255),
    chuc_vu NVARCHAR(50),
    luong_co_ban DECIMAL(12,2),
    ngay_tuyen DATETIME
);

-- 2. tai_khoan
CREATE TABLE tai_khoan (
    ten_dang_nhap VARCHAR(50) PRIMARY KEY,
    mat_khau VARCHAR(255) NOT NULL,
    vai_tro VARCHAR(20) NOT NULL,
    ma_nv INT UNIQUE,
    ma_kh INT UNIQUE,                    -- NULL nếu là tài khoản nhân viên
    kich_hoat BIT DEFAULT 1,             -- 1 = true, 0 = false
    CONSTRAINT fk_taikhoan_nhanvien FOREIGN KEY (ma_nv) 
        REFERENCES nhan_vien(ma_nv) ON DELETE SET NULL
);

-- 3. khach_hang
CREATE TABLE khach_hang (
    ma_kh INT IDENTITY(1,1) PRIMARY KEY,
    ho_ten NVARCHAR(100) NOT NULL,
    ngay_sinh DATE,
    gioi_tinh NVARCHAR(10),
    cmnd_cccd VARCHAR(20),
    sdt VARCHAR(15),
    email VARCHAR(100),
    dia_chi NVARCHAR(255),
    hang_thanh_vien NVARCHAR(20) DEFAULT N'Thường',
    ngay_tao DATETIME DEFAULT GETDATE()
);

-- Thêm FK từ tai_khoan tới khach_hang
ALTER TABLE tai_khoan 
ADD CONSTRAINT fk_taikhoan_khachhang 
    FOREIGN KEY (ma_kh) REFERENCES khach_hang(ma_kh) ON DELETE SET NULL;

-- 4. dich_vu
CREATE TABLE dich_vu (
    ma_dv INT IDENTITY(1,1) PRIMARY KEY,
    ten_dv NVARCHAR(100) NOT NULL,
    loai_dv NVARCHAR(50),
    don_gia DECIMAL(12,2) NOT NULL,
    don_vi NVARCHAR(20),
    so_luong_ton INT DEFAULT 0,
    trang_thai NVARCHAR(20) DEFAULT N'Hoạt động'
);

-- 5. chi_tiet_dv
CREATE TABLE chi_tiet_dv (
    ma_ct INT IDENTITY(1,1) PRIMARY KEY,
    ma_phieu INT,
    ma_dv INT,
    so_luong INT NOT NULL,
    don_gia DECIMAL(12,2) NOT NULL,
    thanh_tien AS (so_luong * don_gia) PERSISTED,   -- Tính tự động và lưu trữ
    CONSTRAINT fk_ctdv_dichvu FOREIGN KEY (ma_dv) 
        REFERENCES dich_vu(ma_dv) ON DELETE NO ACTION
);

-- 6. co_so
CREATE TABLE co_so (
    ma_co_so INT IDENTITY(1,1) PRIMARY KEY,
    ten_co_so NVARCHAR(100) NOT NULL,
    thanh_pho NVARCHAR(50),
    dia_chi NVARCHAR(255),
    sdt VARCHAR(15)
);

-- 7. loai_san
CREATE TABLE loai_san (
    ma_loai INT IDENTITY(1,1) PRIMARY KEY,
    ten_loai NVARCHAR(50) NOT NULL,
    don_gia_gio DECIMAL(10,2) NOT NULL,
    don_vi_tinh NVARCHAR(20) DEFAULT N'giờ',
    mo_ta NVARCHAR(MAX)
);

-- 8. san
CREATE TABLE san (
    ma_san INT IDENTITY(1,1) PRIMARY KEY,
    ma_co_so INT,
    ma_loai INT,
    ten_san NVARCHAR(100) NOT NULL,
    tinh_trang NVARCHAR(30) DEFAULT N'Trống',
    suc_chua INT,
    CONSTRAINT fk_san_coso FOREIGN KEY (ma_co_so) 
        REFERENCES co_so(ma_co_so) ON DELETE CASCADE,
    CONSTRAINT fk_san_loaisan FOREIGN KEY (ma_loai) 
        REFERENCES loai_san(ma_loai) ON DELETE NO ACTION
);

-- 9. bang_gia
CREATE TABLE bang_gia (
    ma_gia INT IDENTITY(1,1) PRIMARY KEY,
    ma_loai INT,
    loai_ngay NVARCHAR(20) NOT NULL,     -- Bình thường, Cuối tuần, Lễ
    khung_gio NVARCHAR(20) NOT NULL,
    gia DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_banggia_loaisan FOREIGN KEY (ma_loai) 
        REFERENCES loai_san(ma_loai) ON DELETE CASCADE
);

-- 10. uu_dai
CREATE TABLE uu_dai (
    ma_uu_dai INT IDENTITY(1,1) PRIMARY KEY,
    ma_loai INT,
    ten_uu_dai NVARCHAR(100),
    ma_giam_gia VARCHAR(20),
    phan_tram_giam DECIMAL(5,2),
    doi_tuong_ap_dung NVARCHAR(100),
    hang_thanh_vien NVARCHAR(20),
    ngay_bd DATETIME,
    ngay_kt DATETIME,
    hoat_dong BIT DEFAULT 1,
    CONSTRAINT fk_uudai_loaisan FOREIGN KEY (ma_loai) 
        REFERENCES loai_san(ma_loai) ON DELETE SET NULL
);

-- 11. phieu_dat_san
CREATE TABLE phieu_dat_san (
    ma_phieu INT IDENTITY(1,1) PRIMARY KEY,
    ma_kh INT,
    ma_san INT,
    ma_nv INT,
    nguoi_tao_phieu NVARCHAR(100),
    ngay_dat DATETIME DEFAULT GETDATE(),
    gio_bat_dau TIME NOT NULL,
    gio_ket_thuc TIME NOT NULL,
    hinh_thuc NVARCHAR(30) DEFAULT N'Đặt trước',
    trang_thai NVARCHAR(30) DEFAULT N'Chờ xác nhận',
    CONSTRAINT fk_phieu_khachhang FOREIGN KEY (ma_kh) 
        REFERENCES khach_hang(ma_kh) ON DELETE SET NULL,
    CONSTRAINT fk_phieu_san FOREIGN KEY (ma_san) 
        REFERENCES san(ma_san) ON DELETE NO ACTION,
    CONSTRAINT fk_phieu_nhanvien FOREIGN KEY (ma_nv) 
        REFERENCES nhan_vien(ma_nv) ON DELETE SET NULL
);

-- update constraint ma_phieu
ALTER TABLE chi_tiet_dv 
ADD CONSTRAINT fk_ctdv_phieu FOREIGN KEY (ma_phieu) 
        REFERENCES phieu_dat_san(ma_phieu) ON DELETE CASCADE

-- 12. lich_su_thay_doi
CREATE TABLE lich_su_thay_doi (
    ma_ls INT IDENTITY(1,1) PRIMARY KEY,
    ma_phieu INT,
    loai_thay_doi NVARCHAR(50),
    thoi_gian DATETIME DEFAULT GETDATE(),
    ly_do NVARCHAR(MAX),
    nguoi_thuc_hien NVARCHAR(100),
    CONSTRAINT fk_lichsu_phieudat FOREIGN KEY (ma_phieu) 
        REFERENCES phieu_dat_san(ma_phieu) ON DELETE CASCADE
);

-- 13. hoa_don (quan hệ 1-1 với phieu_dat_san)
CREATE TABLE hoa_don (
    ma_hd INT IDENTITY(1,1) PRIMARY KEY,
    ma_phieu INT UNIQUE,                 -- 1 phiếu chỉ có 1 hóa đơn
    ngay_lap DATETIME DEFAULT GETDATE(),
    tong_tien DECIMAL(12,2),
    thue DECIMAL(12,2) DEFAULT 0,
    giam_gia DECIMAL(12,2) DEFAULT 0,
    tong_cuoi AS (tong_tien + thue - giam_gia) PERSISTED,
    CONSTRAINT fk_hoadon_phieu FOREIGN KEY (ma_phieu) 
        REFERENCES phieu_dat_san(ma_phieu) ON DELETE NO ACTION
);

-- 14. thanh_toan
CREATE TABLE thanh_toan (
    ma_tt INT IDENTITY(1,1) PRIMARY KEY,
    ma_hd INT,
    ma_nv INT,
    so_tien DECIMAL(12,2) NOT NULL,
    hinh_thuc NVARCHAR(30) NOT NULL,
    ngay_tt DATETIME DEFAULT GETDATE(),
    nguoi_tt NVARCHAR(100),
    trang_thai NVARCHAR(20) DEFAULT N'Hoàn tất',
    CONSTRAINT fk_thanhtoan_hoadon FOREIGN KEY (ma_hd) 
        REFERENCES hoa_don(ma_hd) ON DELETE CASCADE,
    CONSTRAINT fk_thanhtoan_nhanvien FOREIGN KEY (ma_nv) 
        REFERENCES nhan_vien(ma_nv) ON DELETE SET NULL
);

-- 15. Các bảng còn lại (đảm bảo đúng thứ tự tạo)
CREATE TABLE don_nghi_phep (
    ma_don INT IDENTITY(1,1) PRIMARY KEY,
    ma_nv INT,
    ngay_nghi DATE NOT NULL,
    ly_do NVARCHAR(MAX),
    trang_thai NVARCHAR(20) DEFAULT N'Chờ duyệt',
    CONSTRAINT fk_donnghiphep_nhanvien FOREIGN KEY (ma_nv) 
        REFERENCES nhan_vien(ma_nv) ON DELETE CASCADE
);

CREATE TABLE ca_truc (
    ma_ca INT IDENTITY(1,1) PRIMARY KEY,
    ngay DATE NOT NULL,
    gio_bat_dau TIME NOT NULL,
    gio_ket_thuc TIME NOT NULL,
    ten_ca NVARCHAR(30)
);

CREATE TABLE phan_cong_ca (
    ma_pc INT IDENTITY(1,1) PRIMARY KEY,
    ma_nv INT,
    ma_ca INT,
    CONSTRAINT fk_pc_nhanvien FOREIGN KEY (ma_nv) 
        REFERENCES nhan_vien(ma_nv) ON DELETE CASCADE,
    CONSTRAINT fk_pc_catruc FOREIGN KEY (ma_ca) 
        REFERENCES ca_truc(ma_ca) ON DELETE CASCADE
);

CREATE TABLE tham_so_he_thong (
    ma_tham_so INT IDENTITY(1,1) PRIMARY KEY,
    ten_tham_so NVARCHAR(100) NOT NULL,
    gia_tri NVARCHAR(255),
    don_vi NVARCHAR(20),
    mo_ta NVARCHAR(MAX)
);

CREATE TABLE chinh_sach_huy (
    ma_cs INT IDENTITY(1,1) PRIMARY KEY,
    ten_chinh_sach NVARCHAR(100),
    gio_truoc_huy INT,
    phan_tram_phat DECIMAL(5,2),
    mo_ta NVARCHAR(MAX)
);

CREATE TABLE bao_cao (
    ma_bc INT IDENTITY(1,1) PRIMARY KEY,
    ten_bc NVARCHAR(100),
    ngay_tao DATETIME DEFAULT GETDATE(),
    nguoi_tao NVARCHAR(100),
    duong_dan NVARCHAR(255),
    mo_ta NVARCHAR(MAX)
);