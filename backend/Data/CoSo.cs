using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class CoSo
{
    public int MaCoSo { get; set; }

    public string? TenCoSo { get; set; }

    public string? ThanhPho { get; set; }

    public string? DiaChi { get; set; }

    public string? Sdt { get; set; }

    public virtual ICollection<CaTruc> CaTrucs { get; set; } = new List<CaTruc>();

    public virtual ICollection<NhanVien> NhanViens { get; set; } = new List<NhanVien>();

    public virtual ICollection<San> Sans { get; set; } = new List<San>();

    public virtual ICollection<TonKhoDichVu> TonKhoDichVus { get; set; } = new List<TonKhoDichVu>();
}
