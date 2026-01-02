using System;
using System.Collections.Generic;

namespace backend.Data;

public partial class LoaiSan
{
    public int MaLoai { get; set; }

    public string? TenLoai { get; set; }

    public string? DonViTinh { get; set; }

    public string? MoTa { get; set; }

    public virtual ICollection<BangGium> BangGia { get; set; } = new List<BangGium>();

    public virtual ICollection<San> Sans { get; set; } = new List<San>();

    public virtual ICollection<UuDai> UuDais { get; set; } = new List<UuDai>();
}
