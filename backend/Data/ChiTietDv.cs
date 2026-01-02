using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class ChiTietDv
{
    public int MaCt { get; set; }

    public int? MaPhieu { get; set; }

    public int? MaDv { get; set; }

    public int? SoLuong { get; set; }

    public decimal? DonGia { get; set; }

    public decimal? ThanhTien { get; set; }

    public virtual DichVu? MaDvNavigation { get; set; }

    public virtual PhieuDatSan? MaPhieuNavigation { get; set; }
}
