using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class TonKhoDichVu
{
    public int MaTonKho { get; set; }

    public int? MaDv { get; set; }

    public int? MaCoSo { get; set; }

    public int? SoLuongTon { get; set; }

    public DateTime? NgayCapNhat { get; set; }

    public virtual CoSo? MaCoSoNavigation { get; set; }

    public virtual DichVu? MaDvNavigation { get; set; }
}
