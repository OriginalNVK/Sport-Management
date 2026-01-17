namespace backend.DTOs;

public class HoldSanRequest
{
    public int MaSan { get; set; }
    public DateOnly NgayDat { get; set; }
    public TimeOnly GioBatDau { get; set; }
    public TimeOnly GioKetThuc { get; set; }
    public string? Owner { get; set; } // maKh/maNv/username để trace
}

public class ConfirmBookingRequest : CreateBookingRequest
{
    public Guid HoldToken { get; set; }
}