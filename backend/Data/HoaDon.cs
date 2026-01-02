using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class HoaDon
{
    public int MaHd { get; set; }

    public int? MaPhieu { get; set; }

    public DateTime? NgayLap { get; set; }

    public decimal? TongTien { get; set; }

    public decimal? Thue { get; set; }

    public decimal? GiamGia { get; set; }

    public decimal? TongCuoi { get; set; }

    public virtual PhieuDatSan? MaPhieuNavigation { get; set; }

    public virtual ICollection<ThanhToan> ThanhToans { get; set; } = new List<ThanhToan>();
}
