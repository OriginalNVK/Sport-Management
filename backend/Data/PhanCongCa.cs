using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class PhanCongCa
{
    public int MaPc { get; set; }

    public int? MaNv { get; set; }

    public int? MaCa { get; set; }

    public virtual CaTruc? MaCaNavigation { get; set; }

    public virtual NhanVien? MaNvNavigation { get; set; }
}
