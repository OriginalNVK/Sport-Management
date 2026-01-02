USE QuanLySanBong;
----------------------------------------------
-- loai_san
----------------------------------------------
ALTER TABLE loai_san
ADD CONSTRAINT chk_loai_san_don_vi_tinh
CHECK (don_vi_tinh IN ('gio','ca','tran'));


----------------------------------------------
-- khach_hang
----------------------------------------------
ALTER TABLE khach_hang
ADD CONSTRAINT chk_kh_gioi_tinh
CHECK (gioi_tinh IN ('nam','nu','khac'));

ALTER TABLE khach_hang
ADD CONSTRAINT chk_kh_hang
CHECK (hang_thanh_vien IN ('thuong','bac','vang','kim_cuong'));


----------------------------------------------
-- nhan_vien
----------------------------------------------
ALTER TABLE nhan_vien
ADD CONSTRAINT chk_nv_gioi_tinh
CHECK (gioi_tinh IN ('nam','nu','khac'));

ALTER TABLE nhan_vien
ADD CONSTRAINT chk_nv_chuc_vu
CHECK (chuc_vu IN ('ql','lt','kt','tn'));  -- quản lý, lễ tân, kỹ thuật, thu ngân


----------------------------------------------
-- tai_khoan
----------------------------------------------
ALTER TABLE tai_khoan
ADD CONSTRAINT chk_tk_vai_tro
CHECK (vai_tro IN (
    'khach_hang','le_tan','thu_ngan','ky_thuat','quan_ly','admin'
));


----------------------------------------------
-- don_nghi_phep
----------------------------------------------
ALTER TABLE don_nghi_phep
ADD CONSTRAINT chk_nghi_phep_trang_thai
CHECK (trang_thai IN ('cho_duyet','da_duyet','tu_choi'));


----------------------------------------------
-- bang_gia
----------------------------------------------
ALTER TABLE bang_gia
ADD CONSTRAINT chk_banggia_loai_ngay
CHECK (loai_ngay IN ('thuong','cuoi_tuan','le'));

ALTER TABLE bang_gia
ADD CONSTRAINT chk_banggia_khung_gio
CHECK (khung_gio IN ('sang','chieu','toi'));


----------------------------------------------
-- dich_vu
----------------------------------------------
ALTER TABLE dich_vu
ADD CONSTRAINT chk_dichvu_loai
CHECK (loai_dv IN ('bong','huan_luyen_vien','thue_phong','do_uong','trang_phuc'));

ALTER TABLE dich_vu
ADD CONSTRAINT chk_dichvu_trang_thai
CHECK (trang_thai IN ('hoat_dong','ngung'));

----------------------------------------------
-- phieu_dat_san
----------------------------------------------
ALTER TABLE phieu_dat_san
ADD CONSTRAINT chk_phieu_hinh_thuc
CHECK (hinh_thuc IN ('online','truc_tiep'));

ALTER TABLE phieu_dat_san
ADD CONSTRAINT chk_phieu_trang_thai
CHECK (trang_thai IN ('cho_xac_nhan','da_xac_nhan','huy','hoan_tien'));

ALTER TABLE phieu_dat_san
ADD CONSTRAINT chk_phieu_tt
CHECK (tinh_trang_tt IN ('chua_tt','da_tt','hoan_tien'));

----------------------------------------------
-- thanh_toan
----------------------------------------------
ALTER TABLE thanh_toan
ADD CONSTRAINT chk_thanhtoan_hinhthuc
CHECK (hinh_thuc IN ('tien_mat','the','vi_dien_tu'));

ALTER TABLE thanh_toan
ADD CONSTRAINT chk_thanhtoan_trangthai
CHECK (trang_thai IN ('cho_xac_nhan','thanh_cong','that_bai'));


----------------------------------------------
-- bao_tri
----------------------------------------------
ALTER TABLE bao_tri
ADD CONSTRAINT chk_baotri_trangthai
CHECK (trang_thai IN ('dang_bao_tri','hoan_thanh','cho_duyet'));


----------------------------------------------
-- lich_su_thay_doi
----------------------------------------------
ALTER TABLE lich_su_thay_doi
ADD CONSTRAINT chk_ls_loai
CHECK (loai_thay_doi IN ('doi_gio','huy','no_show'));


----------------------------------------------
-- uu_dai
----------------------------------------------
ALTER TABLE uu_dai
ADD CONSTRAINT chk_uudai_doituong
CHECK (doi_tuong_ap_dung IN ('thanh_vien','hoc_sinh','nguoi_cao_tuoi'));

ALTER TABLE uu_dai
ADD CONSTRAINT chk_uudai_hang
CHECK (hang_thanh_vien IN ('silver','gold','platinum', 'none'));


----------------------------------------------
-- chinh_sach_huy
----------------------------------------------
-- phan_tram_phat 0–100%
ALTER TABLE chinh_sach_huy
ADD CONSTRAINT chk_cshuy_phantram
CHECK (phan_tram_phat >= 0 AND phan_tram_phat <= 100);


----------------------------------------------
-- tham_so_he_thong
----------------------------------------------
ALTER TABLE tham_so_he_thong
ADD CONSTRAINT chk_thamso_donvi
CHECK (don_vi IN ('san','gio','phut'));



-- SELECT * 
-- FROM sys.objects 
-- WHERE type_desc LIKE '%CONSTRAINT%';
