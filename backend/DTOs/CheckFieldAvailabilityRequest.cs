namespace backend.DTOs;

public class CheckFieldAvailabilityRequest
{
    public int MaSan { get; set; }
    public DateOnly NgayDat { get; set; }
    public TimeOnly GioBatDau { get; set; }
    public TimeOnly GioKetThuc { get; set; }
}
