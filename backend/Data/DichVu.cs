using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class DichVu
{
    public int MaDv { get; set; }

    public string? TenDv { get; set; }

    public string? LoaiDv { get; set; }

    public decimal? DonGia { get; set; }

    public string? DonVi { get; set; }

    public string? TrangThai { get; set; }

    public virtual ICollection<ChiTietDv> ChiTietDvs { get; set; } = new List<ChiTietDv>();

    public virtual ICollection<TonKhoDichVu> TonKhoDichVus { get; set; } = new List<TonKhoDichVu>();
}
