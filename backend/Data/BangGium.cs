using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class BangGium
{
    public int MaGia { get; set; }

    public int? MaLoai { get; set; }

    public string? LoaiNgay { get; set; }

    public string? KhungGio { get; set; }

    public decimal Gia { get; set; }

    public virtual LoaiSan? MaLoaiNavigation { get; set; }
}
