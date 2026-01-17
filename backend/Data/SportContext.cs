using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public partial class SportContext : DbContext
{
    public SportContext()
    {
    }

    public SportContext(DbContextOptions<SportContext> options)
        : base(options)
    {
    }
		public virtual DbSet<SanHold> SanHolds { get; set; }

    public virtual DbSet<BangGium> BangGiums { get; set; }

    public virtual DbSet<BaoCao> BaoCaos { get; set; }

    public virtual DbSet<BaoTri> BaoTris { get; set; }

    public virtual DbSet<CaTruc> CaTrucs { get; set; }

    public virtual DbSet<ChiTietDv> ChiTietDvs { get; set; }

    public virtual DbSet<ChinhSachHuy> ChinhSachHuys { get; set; }

    public virtual DbSet<CoSo> CoSos { get; set; }

    public virtual DbSet<DichVu> DichVus { get; set; }

    public virtual DbSet<DonNghiPhep> DonNghiPheps { get; set; }

    public virtual DbSet<HoaDon> HoaDons { get; set; }

    public virtual DbSet<HuanLuyenVien> HuanLuyenViens { get; set; }

    public virtual DbSet<KhachHang> KhachHangs { get; set; }

    public virtual DbSet<LichDatSan> LichDatSans { get; set; }

    public virtual DbSet<LichHlv> LichHlvs { get; set; }

    public virtual DbSet<LichSuThayDoi> LichSuThayDois { get; set; }

    public virtual DbSet<LoaiSan> LoaiSans { get; set; }

    public virtual DbSet<NhanVien> NhanViens { get; set; }

    public virtual DbSet<PhanCongCa> PhanCongCas { get; set; }

    public virtual DbSet<PhieuDatSan> PhieuDatSans { get; set; }

    public virtual DbSet<San> Sans { get; set; }

    public virtual DbSet<TaiKhoan> TaiKhoans { get; set; }

    public virtual DbSet<ThamSoHeThong> ThamSoHeThongs { get; set; }

    public virtual DbSet<ThanhToan> ThanhToans { get; set; }

    public virtual DbSet<TonKhoDichVu> TonKhoDichVus { get; set; }

    public virtual DbSet<UuDai> UuDais { get; set; }

//     protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
// #warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
//         => optionsBuilder.UseSqlServer("Server=LAPTOP-2K5E710T\\MSSQLSERVER2025;Database=QuanLySanBong;User Id=sa;Password=Uyen1701*SQL; TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
				modelBuilder.Entity<SanHold>(entity =>
				{
						entity.ToTable("san_hold");

						entity.HasKey(e => e.HoldToken);         
						entity.Property(e => e.HoldToken)
									.HasColumnName("HoldToken");

						entity.Property(e => e.MaSan);

						entity.Property(e => e.NgayDat)
									.HasColumnType("date");

						entity.Property(e => e.GioBatDau)
									.HasColumnType("time(0)");

						entity.Property(e => e.GioKetThuc)
									.HasColumnType("time(0)");

						entity.Property(e => e.CreatedAt)
									.HasColumnType("datetime2");

						entity.Property(e => e.ExpiresAt)
									.HasColumnType("datetime2");

						entity.Property(e => e.Owner)
									.HasMaxLength(50);
				});

        modelBuilder.Entity<BangGium>(entity =>
        {
            entity.HasKey(e => e.MaGia).HasName("PK__bang_gia__072D17D6515F408D");

            entity.ToTable("bang_gia");

            entity.Property(e => e.MaGia).HasColumnName("ma_gia");
            entity.Property(e => e.Gia)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("gia");
            entity.Property(e => e.KhungGio)
                .HasMaxLength(50)
                .HasColumnName("khung_gio");
            entity.Property(e => e.LoaiNgay)
                .HasMaxLength(50)
                .HasColumnName("loai_ngay");
            entity.Property(e => e.MaLoai).HasColumnName("ma_loai");

            entity.HasOne(d => d.MaLoaiNavigation).WithMany(p => p.BangGia)
                .HasForeignKey(d => d.MaLoai)
                .HasConstraintName("FK__bang_gia__ma_loa__6383C8BA");
        });

        modelBuilder.Entity<BaoCao>(entity =>
        {
            entity.HasKey(e => e.MaBc).HasName("PK__bao_cao__0FE17EC28D3C8C52");

            entity.ToTable("bao_cao");

            entity.Property(e => e.MaBc)
                .ValueGeneratedNever()
                .HasColumnName("ma_bc");
            entity.Property(e => e.DuongDan)
                .HasMaxLength(255)
                .HasColumnName("duong_dan");
            entity.Property(e => e.MoTa).HasColumnName("mo_ta");
            entity.Property(e => e.NgayTao)
                .HasColumnType("datetime")
                .HasColumnName("ngay_tao");
            entity.Property(e => e.NguoiTao)
                .HasMaxLength(50)
                .HasColumnName("nguoi_tao");
            entity.Property(e => e.TenBc)
                .HasMaxLength(255)
                .HasColumnName("ten_bc");

            entity.HasOne(d => d.NguoiTaoNavigation).WithMany(p => p.BaoCaos)
                .HasForeignKey(d => d.NguoiTao)
                .HasConstraintName("FK__bao_cao__nguoi_t__0C85DE4D");
        });

        modelBuilder.Entity<BaoTri>(entity =>
        {
            entity.HasKey(e => e.MaBt).HasName("PK__bao_tri__0FE17EF1F1BB1779");

            entity.ToTable("bao_tri");

            entity.Property(e => e.MaBt)
                .ValueGeneratedNever()
                .HasColumnName("ma_bt");
            entity.Property(e => e.MaNv).HasColumnName("ma_nv");
            entity.Property(e => e.MaSan).HasColumnName("ma_san");
            entity.Property(e => e.NgayBt)
                .HasColumnType("datetime")
                .HasColumnName("ngay_bt");
            entity.Property(e => e.NoiDung).HasColumnName("noi_dung");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .HasColumnName("trang_thai");

            entity.HasOne(d => d.MaNvNavigation).WithMany(p => p.BaoTris)
                .HasForeignKey(d => d.MaNv)
                .HasConstraintName("FK__bao_tri__ma_nv__02084FDA");

            entity.HasOne(d => d.MaSanNavigation).WithMany(p => p.BaoTris)
                .HasForeignKey(d => d.MaSan)
                .HasConstraintName("FK__bao_tri__ma_san__01142BA1");
        });

        modelBuilder.Entity<CaTruc>(entity =>
        {
            entity.HasKey(e => e.MaCa).HasName("PK__ca_truc__0FE176ED9F9C58BF");

            entity.ToTable("ca_truc");

            entity.Property(e => e.MaCa)
                .ValueGeneratedNever()
                .HasColumnName("ma_ca");
            entity.Property(e => e.GioBatDau).HasColumnName("gio_bat_dau");
            entity.Property(e => e.GioKetThuc).HasColumnName("gio_ket_thuc");
            entity.Property(e => e.MaCoSo).HasColumnName("ma_co_so");
            entity.Property(e => e.Ngay).HasColumnName("ngay");
            entity.Property(e => e.TenCa)
                .HasMaxLength(255)
                .HasColumnName("ten_ca");

            entity.HasOne(d => d.MaCoSoNavigation).WithMany(p => p.CaTrucs)
                .HasForeignKey(d => d.MaCoSo)
                .HasConstraintName("FK__ca_truc__ma_co_s__59FA5E80");
        });

        modelBuilder.Entity<ChiTietDv>(entity =>
        {
            entity.HasKey(e => e.MaCt).HasName("PK__chi_tiet__0FE176908611C55C");

            entity.ToTable("chi_tiet_dv");

            entity.Property(e => e.MaCt)
                .ValueGeneratedNever()
                .HasColumnName("ma_ct");
            entity.Property(e => e.DonGia)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("don_gia");
            entity.Property(e => e.MaDv).HasColumnName("ma_dv");
            entity.Property(e => e.MaPhieu).HasColumnName("ma_phieu");
            entity.Property(e => e.SoLuong).HasColumnName("so_luong");
            entity.Property(e => e.ThanhTien)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("thanh_tien");

            entity.HasOne(d => d.MaDvNavigation).WithMany(p => p.ChiTietDvs)
                .HasForeignKey(d => d.MaDv)
                .HasConstraintName("FK__chi_tiet___ma_dv__778AC167");

            entity.HasOne(d => d.MaPhieuNavigation).WithMany(p => p.ChiTietDvs)
                .HasForeignKey(d => d.MaPhieu)
                .HasConstraintName("FK__chi_tiet___ma_ph__76969D2E");
            entity.Property(e => e.MaCt)
                .ValueGeneratedOnAdd()
                .HasColumnName("ma_ct");
        });

        modelBuilder.Entity<ChinhSachHuy>(entity =>
        {
            entity.HasKey(e => e.MaCs).HasName("PK__chinh_sa__0FE1769317D302D3");

            entity.ToTable("chinh_sach_huy");

            entity.Property(e => e.MaCs)
                .ValueGeneratedNever()
                .HasColumnName("ma_cs");
            entity.Property(e => e.GioTruocHuy).HasColumnName("gio_truoc_huy");
            entity.Property(e => e.MoTa).HasColumnName("mo_ta");
            entity.Property(e => e.PhanTramPhat)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("phan_tram_phat");
            entity.Property(e => e.TenChinhSach)
                .HasMaxLength(255)
                .HasColumnName("ten_chinh_sach");
        });

        modelBuilder.Entity<CoSo>(entity =>
        {
            entity.HasKey(e => e.MaCoSo).HasName("PK__co_so__3EC536039D887367");

            entity.ToTable("co_so");

            entity.Property(e => e.MaCoSo).HasColumnName("ma_co_so");
            entity.Property(e => e.DiaChi)
                .HasMaxLength(255)
                .HasColumnName("dia_chi");
            entity.Property(e => e.Sdt)
                .HasMaxLength(20)
                .HasColumnName("sdt");
            entity.Property(e => e.TenCoSo)
                .HasMaxLength(255)
                .HasColumnName("ten_co_so");
            entity.Property(e => e.ThanhPho)
                .HasMaxLength(100)
                .HasColumnName("thanh_pho");
        });

        modelBuilder.Entity<DichVu>(entity =>
        {
            entity.HasKey(e => e.MaDv).HasName("PK__dich_vu__0FE14F35C62E4F87");

            entity.ToTable("dich_vu");

            entity.Property(e => e.MaDv)
                .ValueGeneratedNever()
                .HasColumnName("ma_dv");
            entity.Property(e => e.DonGia)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("don_gia");
            entity.Property(e => e.DonVi)
                .HasMaxLength(50)
                .HasColumnName("don_vi");
            entity.Property(e => e.LoaiDv)
                .HasMaxLength(50)
                .HasColumnName("loai_dv");
            entity.Property(e => e.TenDv)
                .HasMaxLength(255)
                .HasColumnName("ten_dv");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .HasColumnName("trang_thai");
        });

        modelBuilder.Entity<DonNghiPhep>(entity =>
        {
            entity.HasKey(e => e.MaDon).HasName("PK__don_nghi__057D6CE185010877");

            entity.ToTable("don_nghi_phep");

            entity.Property(e => e.MaDon).HasColumnName("ma_don");
            entity.Property(e => e.LyDo).HasColumnName("ly_do");
            entity.Property(e => e.MaNv).HasColumnName("ma_nv");
            entity.Property(e => e.NgayNghi).HasColumnName("ngay_nghi");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .HasColumnName("trang_thai");

            entity.HasOne(d => d.MaNvNavigation).WithMany(p => p.DonNghiPheps)
                .HasForeignKey(d => d.MaNv)
                .HasConstraintName("FK__don_nghi___ma_nv__60A75C0F");
        });

        modelBuilder.Entity<HoaDon>(entity =>
        {
            entity.HasKey(e => e.MaHd).HasName("PK__hoa_don__0FE16E86491EB01A");

            entity.ToTable("hoa_don");

            entity.Property(e => e.MaHd)
                .ValueGeneratedNever()
                .HasColumnName("ma_hd");
            entity.Property(e => e.GiamGia)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("giam_gia");
            entity.Property(e => e.MaPhieu).HasColumnName("ma_phieu");
            entity.Property(e => e.NgayLap)
                .HasColumnType("datetime")
                .HasColumnName("ngay_lap");
            entity.Property(e => e.Thue)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("thue");
            entity.Property(e => e.TongCuoi)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("tong_cuoi");
            entity.Property(e => e.TongTien)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("tong_tien");

            entity.HasOne(d => d.MaPhieuNavigation).WithMany(p => p.HoaDons)
                .HasForeignKey(d => d.MaPhieu)
                .HasConstraintName("FK__hoa_don__ma_phie__7A672E12");
        });

        modelBuilder.Entity<HuanLuyenVien>(entity =>
        {
            entity.HasKey(e => e.MaHlv).HasName("PK__huan_luy__047D42BBF324D2C9");

            entity.ToTable("huan_luyen_vien");

            entity.Property(e => e.MaHlv).HasColumnName("ma_hlv");
            entity.Property(e => e.ChuyenMon)
                .HasMaxLength(100)
                .HasColumnName("chuyen_mon");
            entity.Property(e => e.GiaTheoGio)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("gia_theo_gio");
            entity.Property(e => e.HoTen)
                .HasMaxLength(255)
                .HasColumnName("ho_ten");
            entity.Property(e => e.Sdt)
                .HasMaxLength(20)
                .HasColumnName("sdt");
        });

        modelBuilder.Entity<KhachHang>(entity =>
        {
            entity.HasKey(e => e.MaKh).HasName("PK__khach_ha__0FE0B7EE3A2AC524");

            entity.ToTable("khach_hang");

            entity.Property(e => e.MaKh)
                .ValueGeneratedNever()
                .HasColumnName("ma_kh");
            entity.Property(e => e.CmndCccd)
                .HasMaxLength(20)
                .HasColumnName("cmnd_cccd");
            entity.Property(e => e.DiaChi)
                .HasMaxLength(255)
                .HasColumnName("dia_chi");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.GioiTinh)
                .HasMaxLength(10)
                .HasColumnName("gioi_tinh");
            entity.Property(e => e.HangThanhVien)
                .HasMaxLength(50)
                .HasColumnName("hang_thanh_vien");
            entity.Property(e => e.HoTen)
                .HasMaxLength(255)
                .HasColumnName("ho_ten");
            entity.Property(e => e.NgaySinh).HasColumnName("ngay_sinh");
            entity.Property(e => e.NgayTao)
                .HasColumnType("datetime")
                .HasColumnName("ngay_tao");
            entity.Property(e => e.Sdt)
                .HasMaxLength(20)
                .HasColumnName("sdt");
        });

        modelBuilder.Entity<LichDatSan>(entity =>
        {
            entity.HasKey(e => e.MaLich).HasName("PK__lich_dat__C3B19B001EA9AA65");

            entity.ToTable("lich_dat_san");

            entity.Property(e => e.MaLich).HasColumnName("ma_lich");
            entity.Property(e => e.GioBatDau).HasColumnName("gio_bat_dau");
            entity.Property(e => e.GioKetThuc).HasColumnName("gio_ket_thuc");
            entity.Property(e => e.MaPhieu).HasColumnName("ma_phieu");
            entity.Property(e => e.MaSan).HasColumnName("ma_san");
            entity.Property(e => e.Ngay).HasColumnName("ngay");

            entity.HasOne(d => d.MaPhieuNavigation).WithMany(p => p.LichDatSans)
                .HasForeignKey(d => d.MaPhieu)
                .HasConstraintName("FK__lich_dat___ma_ph__73BA3083");

            entity.HasOne(d => d.MaSanNavigation).WithMany(p => p.LichDatSans)
                .HasForeignKey(d => d.MaSan)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__lich_dat___ma_sa__72C60C4A");
        });

        modelBuilder.Entity<LichHlv>(entity =>
        {
            entity.HasKey(e => e.MaLich).HasName("PK__lich_hlv__C3B19B00B9B8B0F2");

            entity.ToTable("lich_hlv");

            entity.Property(e => e.MaLich).HasColumnName("ma_lich");
            entity.Property(e => e.DonGia)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("don_gia");
            entity.Property(e => e.GioBatDau).HasColumnName("gio_bat_dau");
            entity.Property(e => e.GioKetThuc).HasColumnName("gio_ket_thuc");
            entity.Property(e => e.MaHlv).HasColumnName("ma_hlv");
            entity.Property(e => e.MaPhieu).HasColumnName("ma_phieu");
            entity.Property(e => e.ThanhTien)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("thanh_tien");

            entity.HasOne(d => d.MaHlvNavigation).WithMany(p => p.LichHlvs)
                .HasForeignKey(d => d.MaHlv)
                .HasConstraintName("FK__lich_hlv__ma_hlv__123EB7A3");

            entity.HasOne(d => d.MaPhieuNavigation).WithMany(p => p.LichHlvs)
                .HasForeignKey(d => d.MaPhieu)
                .HasConstraintName("FK__lich_hlv__ma_phi__114A936A");
        });

        modelBuilder.Entity<LichSuThayDoi>(entity =>
        {
            entity.HasKey(e => e.MaLs).HasName("PK__lich_su___0FE08C3684ECF3F5");

            entity.ToTable("lich_su_thay_doi");

            entity.Property(e => e.MaLs).HasColumnName("ma_ls");
            entity.Property(e => e.LoaiThayDoi)
                .HasMaxLength(50)
                .HasColumnName("loai_thay_doi");
            entity.Property(e => e.LyDo).HasColumnName("ly_do");
            entity.Property(e => e.MaPhieu).HasColumnName("ma_phieu");
            entity.Property(e => e.SoTienPhat)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("so_tien_phat");
            entity.Property(e => e.ThoiGian)
                .HasColumnType("datetime")
                .HasColumnName("thoi_gian");

            entity.HasOne(d => d.MaPhieuNavigation).WithMany(p => p.LichSuThayDois)
                .HasForeignKey(d => d.MaPhieu)
                .HasConstraintName("FK__lich_su_t__ma_ph__04E4BC85");
        });

        modelBuilder.Entity<LoaiSan>(entity =>
        {
            entity.HasKey(e => e.MaLoai).HasName("PK__loai_san__D9476E57AEE0E0B2");

            entity.ToTable("loai_san");

            entity.Property(e => e.MaLoai)
                .ValueGeneratedNever()
                .HasColumnName("ma_loai");
            entity.Property(e => e.DonViTinh)
                .HasMaxLength(50)
                .HasColumnName("don_vi_tinh");
            entity.Property(e => e.MoTa).HasColumnName("mo_ta");
            entity.Property(e => e.TenLoai)
                .HasMaxLength(255)
                .HasColumnName("ten_loai");
        });

        modelBuilder.Entity<NhanVien>(entity =>
        {
            entity.HasKey(e => e.MaNv).HasName("PK__nhan_vie__0FE15F7C08647051");

            entity.ToTable("nhan_vien");

            entity.Property(e => e.MaNv)
                .ValueGeneratedNever()
                .HasColumnName("ma_nv");
            entity.Property(e => e.ChucVu)
                .HasMaxLength(50)
                .HasColumnName("chuc_vu");
            entity.Property(e => e.CmndCccd)
                .HasMaxLength(20)
                .HasColumnName("cmnd_cccd");
            entity.Property(e => e.DiaChi)
                .HasMaxLength(255)
                .HasColumnName("dia_chi");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.GioiTinh)
                .HasMaxLength(10)
                .HasColumnName("gioi_tinh");
            entity.Property(e => e.HoTen)
                .HasMaxLength(255)
                .HasColumnName("ho_ten");
            entity.Property(e => e.LuongCoBan)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("luong_co_ban");
            entity.Property(e => e.MaCoSo).HasColumnName("ma_co_so");
            entity.Property(e => e.NgaySinh).HasColumnName("ngay_sinh");
            entity.Property(e => e.NgayTuyen)
                .HasColumnType("datetime")
                .HasColumnName("ngay_tuyen");
            entity.Property(e => e.Sdt)
                .HasMaxLength(20)
                .HasColumnName("sdt");

            entity.HasOne(d => d.MaCoSoNavigation).WithMany(p => p.NhanViens)
                .HasForeignKey(d => d.MaCoSo)
                .HasConstraintName("FK__nhan_vien__ma_co__534D60F1");
        });

        modelBuilder.Entity<PhanCongCa>(entity =>
        {
            entity.HasKey(e => e.MaPc).HasName("PK__phan_con__0FE0AF8D3B7A5DA9");

            entity.ToTable("phan_cong_ca");

            entity.Property(e => e.MaPc)
                .ValueGeneratedNever()
                .HasColumnName("ma_pc");
            entity.Property(e => e.MaCa).HasColumnName("ma_ca");
            entity.Property(e => e.MaNv).HasColumnName("ma_nv");

            entity.HasOne(d => d.MaCaNavigation).WithMany(p => p.PhanCongCas)
                .HasForeignKey(d => d.MaCa)
                .HasConstraintName("FK__phan_cong__ma_ca__5DCAEF64");

            entity.HasOne(d => d.MaNvNavigation).WithMany(p => p.PhanCongCas)
                .HasForeignKey(d => d.MaNv)
                .HasConstraintName("FK__phan_cong__ma_nv__5CD6CB2B");
        });

        modelBuilder.Entity<PhieuDatSan>(entity =>
        {
            entity.HasKey(e => e.MaPhieu).HasName("PK__phieu_da__11D0F07AF0BD9E83");

            entity.ToTable("phieu_dat_san");

            entity.Property(e => e.MaPhieu)
                .ValueGeneratedNever()
                .HasColumnName("ma_phieu");
            entity.Property(e => e.GioBatDau).HasColumnName("gio_bat_dau");
            entity.Property(e => e.GioKetThuc).HasColumnName("gio_ket_thuc");
            entity.Property(e => e.HinhThuc)
                .HasMaxLength(50)
                .HasColumnName("hinh_thuc");
            entity.Property(e => e.MaKh).HasColumnName("ma_kh");
            entity.Property(e => e.MaSan).HasColumnName("ma_san");
            entity.Property(e => e.NgayDat).HasColumnName("ngay_dat");
            entity.Property(e => e.NgayTaoPhieu)
                .HasColumnType("datetime")
                .HasColumnName("ngay_tao_phieu");
            entity.Property(e => e.NguoiTaoPhieu)
                .HasMaxLength(50)
                .HasColumnName("nguoi_tao_phieu");
            entity.Property(e => e.TinhTrangTt)
                .HasMaxLength(50)
                .HasColumnName("tinh_trang_tt");
            entity.Property(e => e.TongTien)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("tong_tien");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .HasColumnName("trang_thai");

            entity.HasOne(d => d.MaKhNavigation).WithMany(p => p.PhieuDatSans)
                .HasForeignKey(d => d.MaKh)
                .HasConstraintName("FK__phieu_dat__ma_kh__6E01572D");

            entity.HasOne(d => d.MaSanNavigation).WithMany(p => p.PhieuDatSans)
                .HasForeignKey(d => d.MaSan)
                .HasConstraintName("FK__phieu_dat__ma_sa__6EF57B66");

            entity.HasOne(d => d.NguoiTaoPhieuNavigation).WithMany(p => p.PhieuDatSans)
                .HasForeignKey(d => d.NguoiTaoPhieu)
                .HasConstraintName("FK__phieu_dat__nguoi__6FE99F9F");
        });

        modelBuilder.Entity<San>(entity =>
        {
            entity.HasKey(e => e.MaSan).HasName("PK__san__085E68551EF193E2");

            entity.ToTable("san");

            entity.Property(e => e.MaSan)
                .ValueGeneratedNever()
                .HasColumnName("ma_san");
            entity.Property(e => e.MaCoSo).HasColumnName("ma_co_so");
            entity.Property(e => e.MaLoai).HasColumnName("ma_loai");
            entity.Property(e => e.SucChua).HasColumnName("suc_chua");
            entity.Property(e => e.TenSan)
                .HasMaxLength(255)
                .HasColumnName("ten_san");
            entity.Property(e => e.TinhTrang)
                .HasMaxLength(50)
                .HasColumnName("tinh_trang");

            entity.HasOne(d => d.MaCoSoNavigation).WithMany(p => p.Sans)
                .HasForeignKey(d => d.MaCoSo)
                .HasConstraintName("FK__san__ma_co_so__4D94879B");

            entity.HasOne(d => d.MaLoaiNavigation).WithMany(p => p.Sans)
                .HasForeignKey(d => d.MaLoai)
                .HasConstraintName("FK__san__ma_loai__4E88ABD4");
        });

        modelBuilder.Entity<TaiKhoan>(entity =>
        {
            entity.HasKey(e => e.TenDangNhap).HasName("PK__tai_khoa__363698B222A8D3E9");

            entity.ToTable("tai_khoan");

            entity.Property(e => e.TenDangNhap)
                .HasMaxLength(50)
                .HasColumnName("ten_dang_nhap");
            entity.Property(e => e.KichHoat).HasColumnName("kich_hoat");
            entity.Property(e => e.MaKh).HasColumnName("ma_kh");
            entity.Property(e => e.MaNv).HasColumnName("ma_nv");
            entity.Property(e => e.MatKhau)
                .HasMaxLength(255)
                .HasColumnName("mat_khau");
            entity.Property(e => e.VaiTro)
                .HasMaxLength(50)
                .HasColumnName("vai_tro");

            entity.HasOne(d => d.MaKhNavigation).WithMany(p => p.TaiKhoans)
                .HasForeignKey(d => d.MaKh)
                .HasConstraintName("FK__tai_khoan__ma_kh__5629CD9C");

            entity.HasOne(d => d.MaNvNavigation).WithMany(p => p.TaiKhoans)
                .HasForeignKey(d => d.MaNv)
                .HasConstraintName("FK__tai_khoan__ma_nv__571DF1D5");
        });

        modelBuilder.Entity<ThamSoHeThong>(entity =>
        {
            entity.HasKey(e => e.MaThamSo).HasName("PK__tham_so___A3982C24CD37EB93");

            entity.ToTable("tham_so_he_thong");

            entity.Property(e => e.MaThamSo).HasColumnName("ma_tham_so");
            entity.Property(e => e.DonVi)
                .HasMaxLength(50)
                .HasColumnName("don_vi");
            entity.Property(e => e.GiaTri)
                .HasMaxLength(50)
                .HasColumnName("gia_tri");
            entity.Property(e => e.MoTa).HasColumnName("mo_ta");
            entity.Property(e => e.TenThamSo)
                .HasMaxLength(100)
                .HasColumnName("ten_tham_so");
        });

        modelBuilder.Entity<ThanhToan>(entity =>
        {
            entity.HasKey(e => e.MaTt).HasName("PK__thanh_to__0FE0CD2F12E2DBE1");

            entity.ToTable("thanh_toan");

            entity.Property(e => e.MaTt)
                .ValueGeneratedNever()
                .HasColumnName("ma_tt");
            entity.Property(e => e.HinhThuc)
                .HasMaxLength(50)
                .HasColumnName("hinh_thuc");
            entity.Property(e => e.MaHd).HasColumnName("ma_hd");
            entity.Property(e => e.NgayTt)
                .HasColumnType("datetime")
                .HasColumnName("ngay_tt");
            entity.Property(e => e.NguoiTt)
                .HasMaxLength(50)
                .HasColumnName("nguoi_tt");
            entity.Property(e => e.SoTien)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("so_tien");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .HasColumnName("trang_thai");

            entity.HasOne(d => d.MaHdNavigation).WithMany(p => p.ThanhToans)
                .HasForeignKey(d => d.MaHd)
                .HasConstraintName("FK__thanh_toa__ma_hd__7D439ABD");

            entity.HasOne(d => d.NguoiTtNavigation).WithMany(p => p.ThanhToans)
                .HasForeignKey(d => d.NguoiTt)
                .HasConstraintName("FK__thanh_toa__nguoi__7E37BEF6");
        });

        modelBuilder.Entity<TonKhoDichVu>(entity =>
        {
            entity.HasKey(e => e.MaTonKho).HasName("PK__ton_kho___F3505A73B1C16D41");

            entity.ToTable("ton_kho_dich_vu");

            entity.Property(e => e.MaTonKho).HasColumnName("ma_ton_kho");
            entity.Property(e => e.MaCoSo).HasColumnName("ma_co_so");
            entity.Property(e => e.MaDv).HasColumnName("ma_dv");
            entity.Property(e => e.NgayCapNhat)
                .HasColumnType("datetime")
                .HasColumnName("ngay_cap_nhat");
            entity.Property(e => e.SoLuongTon).HasColumnName("so_luong_ton");

            entity.HasOne(d => d.MaCoSoNavigation).WithMany(p => p.TonKhoDichVus)
                .HasForeignKey(d => d.MaCoSo)
                .HasConstraintName("FK__ton_kho_d__ma_co__693CA210");

            entity.HasOne(d => d.MaDvNavigation).WithMany(p => p.TonKhoDichVus)
                .HasForeignKey(d => d.MaDv)
                .HasConstraintName("FK__ton_kho_d__ma_dv__68487DD7");
        });

        modelBuilder.Entity<UuDai>(entity =>
        {
            entity.HasKey(e => e.MaUuDai).HasName("PK__uu_dai__941DD309FBDE57F9");

            entity.ToTable("uu_dai");

            entity.Property(e => e.MaUuDai)
                .ValueGeneratedNever()
                .HasColumnName("ma_uu_dai");
            entity.Property(e => e.DoiTuongApDung)
                .HasMaxLength(50)
                .HasColumnName("doi_tuong_ap_dung");
            entity.Property(e => e.HangThanhVien)
                .HasMaxLength(50)
                .HasColumnName("hang_thanh_vien");
            entity.Property(e => e.HoatDong).HasColumnName("hoat_dong");
            entity.Property(e => e.MaGiamGia)
                .HasMaxLength(50)
                .HasColumnName("ma_giam_gia");
            entity.Property(e => e.MaLoai).HasColumnName("ma_loai");
            entity.Property(e => e.NgayBd)
                .HasColumnType("datetime")
                .HasColumnName("ngay_bd");
            entity.Property(e => e.NgayKt)
                .HasColumnType("datetime")
                .HasColumnName("ngay_kt");
            entity.Property(e => e.PhanTramGiam)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("phan_tram_giam");
            entity.Property(e => e.TenUuDai)
                .HasMaxLength(255)
                .HasColumnName("ten_uu_dai");

            entity.HasOne(d => d.MaLoaiNavigation).WithMany(p => p.UuDais)
                .HasForeignKey(d => d.MaLoai)
                .HasConstraintName("FK__uu_dai__ma_loai__09A971A2");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
