USE QuanLySanBong;

INSERT INTO co_so (ten_co_so, thanh_pho, dia_chi, sdt)
VALUES
(N'ViệtSport Hà Nội', N'Hà Nội', N'12 Cầu Giấy', '0901000001'),
(N'ViệtSport TP.HCM', N'Hồ Chí Minh', N'99 Lê Văn Sỹ', '0902000002'),
(N'ViệtSport Đà Nẵng', N'Đà Nẵng', N'45 Hải Châu', '0903000003');


INSERT INTO loai_san (ma_loai, ten_loai, don_vi_tinh, mo_ta)
VALUES
(1, N'Sân cầu lông', 'gio', N'Sân cầu lông tiêu chuẩn'),
(2, N'Sân bóng rổ', 'gio', N'Sân bóng rổ ngoài trời'),
(3, N'Sân tennis', 'ca', N'Mỗi ca 2 giờ'),
(4, N'Sân bóng đá mini', 'tran', N'Thời lượng 90 phút');


INSERT INTO san (ma_san, ma_co_so, ma_loai, ten_san, tinh_trang, suc_chua)
VALUES
(1, 1, 1, 'CL01', 'con_trong', 4),
(2, 1, 3, 'TN01', 'con_trong', 4),
(3, 1, 4, 'BD01', 'con_trong', 12),
(4, 2, 1, 'CL02', 'con_trong', 4),
(5, 2, 2, 'BR01', 'bao_tri', 10),
(6, 3, 1, 'CL03', 'con_trong', 4);


INSERT INTO khach_hang (ma_kh, ho_ten, ngay_sinh, gioi_tinh, cmnd_cccd, sdt, email, dia_chi, hang_thanh_vien, ngay_tao)
VALUES
(1, N'Nguyễn Văn A', '1995-02-10', 'nam', '0123456789', '0909000001', 'a@gmail.com', N'Hà Nội', 'thuong', GETDATE()),
(2, N'Trần Thị B', '2000-05-20', 'nu', '0123456790', '0909000002', 'b@gmail.com', N'HCM', 'bac', GETDATE()),
(3, N'Lê Văn C', '1990-09-15', 'nam', '0123456791', '0909000003', 'c@gmail.com', N'Đà Nẵng', 'vang', GETDATE());


INSERT INTO nhan_vien (ma_nv, ma_co_so, ho_ten, ngay_sinh, gioi_tinh, cmnd_cccd, sdt, email, dia_chi, chuc_vu, luong_co_ban, ngay_tuyen)
VALUES
(1, 1, N'Lê Tấn D', '1990-01-01', 'nam', '099111222', '0911000001', 'd@vs.com', N'Hà Nội', 'ql', 15000000, GETDATE()),
(2, 1, N'Phạm Mỹ E', '1995-07-07', 'nu', '099111223', '0911000002', 'e@vs.com', N'Hà Nội', 'lt', 8000000, GETDATE()),
(3, 1, N'Đỗ Quốc F', '1993-03-03', 'nam', '099111224', '0911000003', 'f@vs.com', N'Hà Nội', 'kt', 9000000, GETDATE()),
(4, 1, N'Ngô Thanh G', '1994-10-10', 'nu', '099111225', '0911000004', 'g@vs.com', N'Hà Nội', 'tn', 9000000, GETDATE());


INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro, ma_kh, ma_nv, kich_hoat)
VALUES
('admin', '123456', 'admin', NULL, 1, 1),
('letan1', '123456', 'le_tan', NULL, 2, 1),
('kh1', '123456', 'khach_hang', 1, NULL, 1),
('kh2', '123456', 'khach_hang', 2, NULL, 1);


INSERT INTO ca_truc (ma_ca, ma_co_so, ngay, gio_bat_dau, gio_ket_thuc, ten_ca)
VALUES
(1, 1, '2025-01-10', '06:00', '12:00', N'Ca sáng'),
(2, 1, '2025-01-10', '12:00', '18:00', N'Ca chiều'),
(3, 1, '2025-01-10', '18:00', '23:00', N'Ca tối');


INSERT INTO phan_cong_ca (ma_pc, ma_nv, ma_ca)
VALUES
(1, 2, 1),
(2, 4, 2),
(3, 3, 3);


INSERT INTO don_nghi_phep (ma_nv, ngay_nghi, ly_do, trang_thai)
VALUES
(2, '2025-01-12', N'Ốm', 'cho_duyet'),
(3, '2025-01-15', N'Việc gia đình', 'da_duyet');


INSERT INTO bang_gia (ma_loai, loai_ngay, khung_gio, gia)
VALUES
(1, 'thuong', 'sang', 70000),
(1, 'thuong', 'toi', 90000),
(3, 'cuoi_tuan', 'toi', 250000),
(4, 'le', 'toi', 500000);


INSERT INTO dich_vu (ma_dv, ten_dv, loai_dv, don_gia, don_vi, trang_thai)
VALUES
(1, N'Thuê bóng', 'bong', 20000, 'cai', 'hoat_dong'),
(2, N'Thuê áo bib', 'trang_phuc', 15000, 'bo', 'hoat_dong'),
(3, N'Nước uống', 'do_uong', 10000, 'chai', 'hoat_dong'),
(4, N'Huấn luyện viên cá nhân', 'huan_luyen_vien', 200000, 'gio', 'hoat_dong');


INSERT INTO ton_kho_dich_vu (ma_dv, ma_co_so, so_luong_ton, ngay_cap_nhat)
VALUES
(1, 1, 50, GETDATE()),
(2, 1, 30, GETDATE()),
(3, 4, 100, GETDATE());


INSERT INTO huan_luyen_vien (ho_ten, chuyen_mon, gia_theo_gio, sdt)
VALUES
(N'Phạm Anh H', N'Cầu lông', 150000, '0908000001'),
(N'Đặng Trí I', N'Bóng rổ', 200000, '0908000002');


INSERT INTO phieu_dat_san (ma_phieu, ma_kh, ma_san, nguoi_tao_phieu,ngay_tao_phieu, ngay_dat, gio_bat_dau, gio_ket_thuc, hinh_thuc, trang_thai, tong_tien, tinh_trang_tt)
VALUES
(1, 1, 1, 'letan1', GETDATE(),'2025-12-31', '08:00', '10:00', 'truc_tiep', 'da_xac_nhan', 160000, 'da_tt'),
(2, 2, 2, 'kh2', GETDATE(),'2025-12-31', '14:00', '16:00', 'online', 'cho_xac_nhan', 200000, 'chua_tt');

INSERT INTO lich_dat_san (ma_san, ma_phieu, ngay, gio_bat_dau, gio_ket_thuc)
VALUES
(1, 1, '2025-01-31', '08:00', '09:00'),
(1, 1, '2025-01-31', '09:00', '10:00'),
(2, 2, '2025-01-31', '14:00', '15:00'),
(2, 2, '2025-01-31', '15:00', '16:00');


INSERT INTO chi_tiet_dv (ma_ct, ma_phieu, ma_dv, so_luong, don_gia, thanh_tien)
VALUES
(1, 1, 1, 2, 20000, 40000),
(2, 1, 3, 1, 10000, 10000),
(3, 2, 1, 2, 20000, 40000),
(4, 2, 2, 1, 15000, 15000),
(5, 1, 2, 1, 15000, 15000);


INSERT INTO hoa_don (ma_hd, ma_phieu, ngay_lap, tong_tien, thue, giam_gia, tong_cuoi)
VALUES
(1, 1, GETDATE(), 210000, 10000, 0, 220000);


INSERT INTO thanh_toan (ma_tt, ma_hd, so_tien, hinh_thuc, nguoi_tt, ngay_tt, trang_thai)
VALUES
(1, 1, 220000, 'tien_mat', 'letan1', GETDATE(), 'thanh_cong');


INSERT INTO bao_tri (ma_bt, ma_san, ma_nv, ngay_bt, noi_dung, trang_thai)
VALUES
(1, 5, 3, GETDATE(), N'Sửa bảng rổ', 'dang_bao_tri');


INSERT INTO lich_su_thay_doi (ma_phieu, loai_thay_doi, thoi_gian, ly_do, so_tien_phat)
VALUES
(1, 'doi_gio', GETDATE(), N'Khách đổi sang giờ khác', 0);


INSERT INTO chinh_sach_huy (ma_cs, ten_chinh_sach, gio_truoc_huy, phan_tram_phat, mo_ta)
VALUES
(1, N'Hủy trước 24h', 24, 10, N'Phạt 10%'),
(2, N'Hủy trong 24h', 5, 50, N'Phạt 50%'),
(3, N'No show', 0, 100, N'Phạt 100%');


INSERT INTO uu_dai (ma_uu_dai, ma_loai, ten_uu_dai, ma_giam_gia, phan_tram_giam, doi_tuong_ap_dung, hang_thanh_vien, ngay_bd, ngay_kt, hoat_dong)
VALUES
(1, 1, N'Ưu đãi Silver', 'SLV5', 5, 'thanh_vien', 'silver', GETDATE(), DATEADD(month,1,GETDATE()), 1),
(2, 1, N'Ưu đãi Gold', 'GLD10', 10, 'thanh_vien', 'gold', GETDATE(), DATEADD(month,1,GETDATE()), 1);


INSERT INTO bao_cao (ma_bc, ten_bc, ngay_tao, nguoi_tao, duong_dan, mo_ta)
VALUES
(1, N'Báo cáo doanh thu tháng 1', GETDATE(), 'admin', N'/reports/thang1.pdf', N'Doanh thu chi tiết');


INSERT INTO tham_so_he_thong (ten_tham_so, gia_tri, don_vi, mo_ta)
VALUES
(N'max_san_1_ngay', '2', 'san', N'Tối đa 2 sân mỗi ngày'),
(N'thoi_gian_dat_truoc_toi_thieu', '2', 'gio', N'Đặt tối thiểu 2 giờ trước'),
(N'thoi_gian_giu_cho', '30', 'phut', N'Giữ chỗ 30 phút');


INSERT INTO lich_hlv (ma_phieu, ma_hlv, gio_bat_dau, gio_ket_thuc, don_gia, thanh_tien)
VALUES
(1, 1, '08:00', '09:00', 150000, 150000);

-- extra data
INSERT INTO co_so (ten_co_so, thanh_pho, dia_chi, sdt)
VALUES 
(N'ViệtSport Mỹ Tho', N'Mỹ Tho', N'160-6 Trần Hưng Đạo', '0829929972'),
(N'ViệtSport Nha Trang', N'Nha Trang', N'111 Lê Hồng phong', '0944243816'),
(N'ViệtSport Đà Lạt', N'Đà Lạt', N'222 Hồ Tùng Mậu', '0838345567');

INSERT INTO san(ma_san, ma_co_so, ma_loai, ten_san, tinh_trang, suc_chua)
VALUES
(7, 4, 1, N'Sân cầu lông 1', 'hoat_dong', 20),
(8, 4, 2, N'Sân bóng rổ 1', 'bao_tri', 20),
(9, 5, 3, N'Sân tennis 1', 'hoat_dong', 50),
(10, 5, 4, N'Sân bóng đá 1', 'bao_tri', 20),
(11, 6, 4, N'Sân bóng đá 1', 'hoat_dong', 20),
(12, 6, 1, N'Sân cầu lông 1', 'bao_tri', 20);