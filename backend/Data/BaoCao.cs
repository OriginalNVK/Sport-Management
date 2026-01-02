using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class BaoCao
{
    public int MaBc { get; set; }

    public string? TenBc { get; set; }

    public DateTime? NgayTao { get; set; }

    public string? NguoiTao { get; set; }

    public string? DuongDan { get; set; }

    public string? MoTa { get; set; }

    public virtual TaiKhoan? NguoiTaoNavigation { get; set; }
}
