using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class CaTruc
{
    public int MaCa { get; set; }

    public int? MaCoSo { get; set; }

    public DateOnly? Ngay { get; set; }

    public TimeOnly? GioBatDau { get; set; }

    public TimeOnly? GioKetThuc { get; set; }

    public string? TenCa { get; set; }

    public virtual CoSo? MaCoSoNavigation { get; set; }

    public virtual ICollection<PhanCongCa> PhanCongCas { get; set; } = new List<PhanCongCa>();
}
