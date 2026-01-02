using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class HuanLuyenVien
{
    public int MaHlv { get; set; }

    public string? HoTen { get; set; }

    public string? ChuyenMon { get; set; }

    public decimal? GiaTheoGio { get; set; }

    public string? Sdt { get; set; }

    public virtual ICollection<LichHlv> LichHlvs { get; set; } = new List<LichHlv>();
}
