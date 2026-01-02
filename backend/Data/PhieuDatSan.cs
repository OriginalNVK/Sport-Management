using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class PhieuDatSan
{
    public int MaPhieu { get; set; }

    public int? MaKh { get; set; }

    public int? MaSan { get; set; }

    public string? NguoiTaoPhieu { get; set; }

    public DateTime? NgayTaoPhieu { get; set; }

    public DateOnly? NgayDat { get; set; }

    public TimeOnly? GioBatDau { get; set; }

    public TimeOnly? GioKetThuc { get; set; }

    public string? HinhThuc { get; set; }

    public string? TrangThai { get; set; }

    public decimal? TongTien { get; set; }

    public string? TinhTrangTt { get; set; }

    public virtual ICollection<ChiTietDv> ChiTietDvs { get; set; } = new List<ChiTietDv>();

    public virtual ICollection<HoaDon> HoaDons { get; set; } = new List<HoaDon>();

    public virtual ICollection<LichDatSan> LichDatSans { get; set; } = new List<LichDatSan>();

    public virtual ICollection<LichHlv> LichHlvs { get; set; } = new List<LichHlv>();

    public virtual ICollection<LichSuThayDoi> LichSuThayDois { get; set; } = new List<LichSuThayDoi>();

    public virtual KhachHang? MaKhNavigation { get; set; }

    public virtual San? MaSanNavigation { get; set; }

    public virtual TaiKhoan? NguoiTaoPhieuNavigation { get; set; }
}
