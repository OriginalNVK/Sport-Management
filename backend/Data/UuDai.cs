using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class UuDai
{
    public int MaUuDai { get; set; }

    public int? MaLoai { get; set; }

    public string? TenUuDai { get; set; }

    public string? MaGiamGia { get; set; }

    public decimal? PhanTramGiam { get; set; }

    public string? DoiTuongApDung { get; set; }

    public string? HangThanhVien { get; set; }

    public DateTime? NgayBd { get; set; }

    public DateTime? NgayKt { get; set; }

    public bool? HoatDong { get; set; }

    public virtual LoaiSan? MaLoaiNavigation { get; set; }
}
