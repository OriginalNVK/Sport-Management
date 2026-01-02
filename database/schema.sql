CREATE DATABASE QuanLySanBong;
USE QuanLySanBong;

-- Active: 1763047677278@@127.0.0.1@1433@TTTT
-- Table: loai_san
CREATE TABLE loai_san (
    ma_loai INT PRIMARY KEY,
    ten_loai NVARCHAR(255),
    don_vi_tinh NVARCHAR(50), -- gio, ca, tran
    mo_ta NVARCHAR(MAX)
);

-- Table: co_so
CREATE TABLE co_so (
    ma_co_so INT IDENTITY(1,1) PRIMARY KEY,
    ten_co_so NVARCHAR(255),
    thanh_pho NVARCHAR(100),
    dia_chi NVARCHAR(255),
    sdt NVARCHAR(20)
);

-- Table: san
CREATE TABLE san (
    ma_san INT PRIMARY KEY,
    ma_co_so INT FOREIGN KEY REFERENCES co_so(ma_co_so),
    ma_loai INT FOREIGN KEY REFERENCES loai_san(ma_loai),
    ten_san NVARCHAR(255),
    tinh_trang NVARCHAR(50),
    suc_chua INT
);

-- Table: khach_hang
CREATE TABLE khach_hang (
    ma_kh INT PRIMARY KEY,
    ho_ten NVARCHAR(255),
    ngay_sinh DATE,
    gioi_tinh NVARCHAR(10),
    cmnd_cccd NVARCHAR(20),
    sdt NVARCHAR(20),
    email NVARCHAR(100),
    dia_chi NVARCHAR(255),
    hang_thanh_vien NVARCHAR(50), -- thuong, bac, vang, kim_cuong
    ngay_tao DATETIME
);

-- Table: nhan_vien
CREATE TABLE nhan_vien (
    ma_nv INT PRIMARY KEY,
    ma_co_so INT FOREIGN KEY REFERENCES co_so(ma_co_so),
    ho_ten NVARCHAR(255),
    ngay_sinh DATE,
    gioi_tinh NVARCHAR(10),
    cmnd_cccd NVARCHAR(20),
    sdt NVARCHAR(20),
    email NVARCHAR(100),
    dia_chi NVARCHAR(255),
    chuc_vu NVARCHAR(50), -- ql, lt, kt, tn
    luong_co_ban DECIMAL(18,2),
    ngay_tuyen DATETIME
);

-- Table: tai_khoan
CREATE TABLE tai_khoan (
    ten_dang_nhap NVARCHAR(50) PRIMARY KEY,
    mat_khau NVARCHAR(255),
    vai_tro NVARCHAR(50), -- khach_hang, le_tan, thu_ngan, ky_thuat, quan_ly, admin, nhanvien_bt
    ma_kh INT NULL FOREIGN KEY REFERENCES khach_hang(ma_kh),
    ma_nv INT NULL FOREIGN KEY REFERENCES nhan_vien(ma_nv),
    kich_hoat BIT
);

-- Table: ca_truc
CREATE TABLE ca_truc (
    ma_ca INT PRIMARY KEY,
    ma_co_so INT FOREIGN KEY REFERENCES co_so(ma_co_so),
    ngay DATE,
    gio_bat_dau TIME,
    gio_ket_thuc TIME,
    ten_ca NVARCHAR(255)
);

-- Table: phan_cong_ca
CREATE TABLE phan_cong_ca (
    ma_pc INT PRIMARY KEY,
    ma_nv INT FOREIGN KEY REFERENCES nhan_vien(ma_nv),
    ma_ca INT FOREIGN KEY REFERENCES ca_truc(ma_ca)
);

-- Table: don_nghi_phep
CREATE TABLE don_nghi_phep (
    ma_don INT IDENTITY(1,1) PRIMARY KEY,
    ma_nv INT FOREIGN KEY REFERENCES nhan_vien(ma_nv),
    ngay_nghi DATE,
    ly_do NVARCHAR(MAX),
    trang_thai NVARCHAR(50) -- cho_duyet, da_duyet, tu_choi
);

-- Table: bang_gia
CREATE TABLE bang_gia (
    ma_gia INT IDENTITY(1,1) PRIMARY KEY,
    ma_loai INT FOREIGN KEY REFERENCES loai_san(ma_loai),
    loai_ngay NVARCHAR(50), -- thuong, cuoi_tuan, le
    khung_gio NVARCHAR(50), -- sang, chieu, toi
    gia DECIMAL(18,2) NOT NULL
);

-- Table: dich_vu
CREATE TABLE dich_vu (
    ma_dv INT PRIMARY KEY,
    ten_dv NVARCHAR(255),
    loai_dv NVARCHAR(50), -- bong, huan_luyen_vien, thue_phong, do_uong, trang_phuc
    don_gia DECIMAL(18,2),
    don_vi NVARCHAR(50),
    trang_thai NVARCHAR(50)
);

-- Table: ton_kho_dich_vu
CREATE TABLE ton_kho_dich_vu (
    ma_ton_kho INT IDENTITY(1,1) PRIMARY KEY,
    ma_dv INT FOREIGN KEY REFERENCES dich_vu(ma_dv),
    ma_co_so INT FOREIGN KEY REFERENCES co_so(ma_co_so),
    so_luong_ton INT,
    ngay_cap_nhat DATETIME
);

-- Table: huan_luyen_vien
CREATE TABLE huan_luyen_vien (
    ma_hlv INT IDENTITY(1,1) PRIMARY KEY,
    ho_ten NVARCHAR(255),
    chuyen_mon NVARCHAR(100),
    gia_theo_gio DECIMAL(18,2),
    sdt NVARCHAR(20)
);

-- Table: phieu_dat_san
CREATE TABLE phieu_dat_san (
    ma_phieu INT PRIMARY KEY,
    ma_kh INT FOREIGN KEY REFERENCES khach_hang(ma_kh),
    ma_san INT FOREIGN KEY REFERENCES san(ma_san),
    nguoi_tao_phieu NVARCHAR(50) FOREIGN KEY REFERENCES tai_khoan(ten_dang_nhap),
    ngay_tao_phieu DATETIME,
    ngay_dat DATE,
    gio_bat_dau TIME,
    gio_ket_thuc TIME,
    hinh_thuc NVARCHAR(50), -- online, truc_tiep
    trang_thai NVARCHAR(50), -- cho_xac_nhan, da_xac_nhan, huy, hoan_tien
    tong_tien DECIMAL(18,2),
    tinh_trang_tt NVARCHAR(50) -- chua_tt, da_tt, hoan_tien
);

-- Table: lich_dat_san (phuc vu kiem tra san trong)
CREATE TABLE lich_dat_san (
    ma_lich INT IDENTITY(1,1) PRIMARY KEY,
    ma_san INT NOT NULL FOREIGN KEY REFERENCES san(ma_san),
    ma_phieu INT FOREIGN KEY REFERENCES phieu_dat_san(ma_phieu),
    ngay DATE NOT NULL,
    gio_bat_dau TIME NOT NULL,
    gio_ket_thuc TIME NOT NULL    
);


-- Table: chi_tiet_dv
CREATE TABLE chi_tiet_dv (
    ma_ct INT PRIMARY KEY,
    ma_phieu INT FOREIGN KEY REFERENCES phieu_dat_san(ma_phieu),
    ma_dv INT FOREIGN KEY REFERENCES dich_vu(ma_dv),
    so_luong INT,
    don_gia DECIMAL(18,2),
    thanh_tien DECIMAL(18,2)
);

-- Table: hoa_don
CREATE TABLE hoa_don (
    ma_hd INT PRIMARY KEY,
    ma_phieu INT FOREIGN KEY REFERENCES phieu_dat_san(ma_phieu),
    ngay_lap DATETIME,
    tong_tien DECIMAL(18,2),
    thue DECIMAL(18,2),
    giam_gia DECIMAL(18,2),
    tong_cuoi DECIMAL(18,2)
);

-- Table: thanh_toan
CREATE TABLE thanh_toan (
    ma_tt INT PRIMARY KEY,
    ma_hd INT FOREIGN KEY REFERENCES hoa_don(ma_hd),
    so_tien DECIMAL(18,2),
    hinh_thuc NVARCHAR(50), -- tien_mat, the, vi_dien_tu
    nguoi_tt NVARCHAR(50) FOREIGN KEY REFERENCES tai_khoan(ten_dang_nhap),
    ngay_tt DATETIME,
    trang_thai NVARCHAR(50)
);

-- Table: bao_tri
CREATE TABLE bao_tri (
    ma_bt INT PRIMARY KEY,
    ma_san INT FOREIGN KEY REFERENCES san(ma_san),
    ma_nv INT FOREIGN KEY REFERENCES nhan_vien(ma_nv),
    ngay_bt DATETIME,
    noi_dung NVARCHAR(MAX),
    trang_thai NVARCHAR(50)
);

-- Table: lich_su_thay_doi
CREATE TABLE lich_su_thay_doi (
    ma_ls INT IDENTITY(1,1) PRIMARY KEY,
    ma_phieu INT FOREIGN KEY REFERENCES phieu_dat_san(ma_phieu),
    loai_thay_doi NVARCHAR(50), -- doi_gio, huy, no_show
    thoi_gian DATETIME,
    ly_do NVARCHAR(MAX),
    so_tien_phat DECIMAL(18,2)
);

-- Table: chinh_sach_huy
CREATE TABLE chinh_sach_huy (
    ma_cs INT PRIMARY KEY,
    ten_chinh_sach NVARCHAR(255),
    gio_truoc_huy INT,
    phan_tram_phat DECIMAL(5,2),
    mo_ta NVARCHAR(MAX)
);

-- Table: uu_dai
CREATE TABLE uu_dai (
    ma_uu_dai INT PRIMARY KEY,
    ma_loai INT FOREIGN KEY REFERENCES loai_san(ma_loai),
    ten_uu_dai NVARCHAR(255),
    ma_giam_gia NVARCHAR(50),
    phan_tram_giam DECIMAL(5,2),
    doi_tuong_ap_dung NVARCHAR(50),
    hang_thanh_vien NVARCHAR(50),
    ngay_bd DATETIME,
    ngay_kt DATETIME,
    hoat_dong BIT
);

-- Table: bao_cao
CREATE TABLE bao_cao (
    ma_bc INT PRIMARY KEY,
    ten_bc NVARCHAR(255),
    ngay_tao DATETIME,
    nguoi_tao NVARCHAR(50) FOREIGN KEY REFERENCES tai_khoan(ten_dang_nhap),
    duong_dan NVARCHAR(255),
    mo_ta NVARCHAR(MAX)
);

-- Table: tham_so_he_thong
CREATE TABLE tham_so_he_thong (
    ma_tham_so INT IDENTITY(1,1) PRIMARY KEY,
    ten_tham_so NVARCHAR(100),
    gia_tri NVARCHAR(50),
    don_vi NVARCHAR(50),
    mo_ta NVARCHAR(MAX)
);

-- Table: lich_hlv
CREATE TABLE lich_hlv (
    ma_lich INT IDENTITY(1,1) PRIMARY KEY,
    ma_phieu INT FOREIGN KEY REFERENCES phieu_dat_san(ma_phieu),
    ma_hlv INT FOREIGN KEY REFERENCES huan_luyen_vien(ma_hlv),
    gio_bat_dau TIME,
    gio_ket_thuc TIME,
    don_gia DECIMAL(18,2),
    thanh_tien DECIMAL(18,2)
);
