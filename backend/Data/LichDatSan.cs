using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class LichDatSan
{
    public int MaLich { get; set; }

    public int MaSan { get; set; }

    public int? MaPhieu { get; set; }

    public DateOnly Ngay { get; set; }

    public TimeOnly GioBatDau { get; set; }

    public TimeOnly GioKetThuc { get; set; }

    public virtual PhieuDatSan? MaPhieuNavigation { get; set; }

    public virtual San MaSanNavigation { get; set; } = null!;
}
