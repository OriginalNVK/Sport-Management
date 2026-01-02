using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class LichSuThayDoi
{
    public int MaLs { get; set; }

    public int? MaPhieu { get; set; }

    public string? LoaiThayDoi { get; set; }

    public DateTime? ThoiGian { get; set; }

    public string? LyDo { get; set; }

    public decimal? SoTienPhat { get; set; }

    public virtual PhieuDatSan? MaPhieuNavigation { get; set; }
}
