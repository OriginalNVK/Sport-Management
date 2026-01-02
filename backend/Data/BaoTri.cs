using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class BaoTri
{
    public int MaBt { get; set; }

    public int? MaSan { get; set; }

    public int? MaNv { get; set; }

    public DateTime? NgayBt { get; set; }

    public string? NoiDung { get; set; }

    public string? TrangThai { get; set; }

    public virtual NhanVien? MaNvNavigation { get; set; }

    public virtual San? MaSanNavigation { get; set; }
}
