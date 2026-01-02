using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class ThanhToan
{
    public int MaTt { get; set; }

    public int? MaHd { get; set; }

    public decimal? SoTien { get; set; }

    public string? HinhThuc { get; set; }

    public string? NguoiTt { get; set; }

    public DateTime? NgayTt { get; set; }

    public string? TrangThai { get; set; }

    public virtual HoaDon? MaHdNavigation { get; set; }

    public virtual TaiKhoan? NguoiTtNavigation { get; set; }
}
