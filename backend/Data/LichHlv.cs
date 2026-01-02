using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class LichHlv
{
    public int MaLich { get; set; }

    public int? MaPhieu { get; set; }

    public int? MaHlv { get; set; }

    public TimeOnly? GioBatDau { get; set; }

    public TimeOnly? GioKetThuc { get; set; }

    public decimal? DonGia { get; set; }

    public decimal? ThanhTien { get; set; }

    public virtual HuanLuyenVien? MaHlvNavigation { get; set; }

    public virtual PhieuDatSan? MaPhieuNavigation { get; set; }
}
