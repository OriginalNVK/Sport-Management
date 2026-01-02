using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class NhanVien
{
    public int MaNv { get; set; }

    public int? MaCoSo { get; set; }

    public string? HoTen { get; set; }

    public DateOnly? NgaySinh { get; set; }

    public string? GioiTinh { get; set; }

    public string? CmndCccd { get; set; }

    public string? Sdt { get; set; }

    public string? Email { get; set; }

    public string? DiaChi { get; set; }

    public string? ChucVu { get; set; }

    public decimal? LuongCoBan { get; set; }

    public DateTime? NgayTuyen { get; set; }

    public virtual ICollection<BaoTri> BaoTris { get; set; } = new List<BaoTri>();

    public virtual ICollection<DonNghiPhep> DonNghiPheps { get; set; } = new List<DonNghiPhep>();

    public virtual CoSo? MaCoSoNavigation { get; set; }

    public virtual ICollection<PhanCongCa> PhanCongCas { get; set; } = new List<PhanCongCa>();

    public virtual ICollection<TaiKhoan> TaiKhoans { get; set; } = new List<TaiKhoan>();
}
