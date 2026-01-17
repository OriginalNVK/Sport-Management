using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Data;

public partial class SanHold
{
    public Guid HoldToken { get; set; }

    public int MaSan { get; set; }

    public DateOnly NgayDat { get; set; }
    public TimeOnly GioBatDau { get; set; }
    public TimeOnly GioKetThuc { get; set; }

    public string? Owner { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
}
