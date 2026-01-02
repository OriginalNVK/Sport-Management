using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class DonNghiPhep
{
    public int MaDon { get; set; }

    public int? MaNv { get; set; }

    public DateOnly? NgayNghi { get; set; }

    public string? LyDo { get; set; }

    public string? TrangThai { get; set; }

    public virtual NhanVien? MaNvNavigation { get; set; }
}
