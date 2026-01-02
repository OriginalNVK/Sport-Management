using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class San
{
    public int MaSan { get; set; }

    public int? MaCoSo { get; set; }

    public int? MaLoai { get; set; }

    public string? TenSan { get; set; }

    public string? TinhTrang { get; set; }

    public int? SucChua { get; set; }

    public virtual ICollection<BaoTri> BaoTris { get; set; } = new List<BaoTri>();

    public virtual ICollection<LichDatSan> LichDatSans { get; set; } = new List<LichDatSan>();

    public virtual CoSo? MaCoSoNavigation { get; set; }

    public virtual LoaiSan? MaLoaiNavigation { get; set; }

    public virtual ICollection<PhieuDatSan> PhieuDatSans { get; set; } = new List<PhieuDatSan>();
}
