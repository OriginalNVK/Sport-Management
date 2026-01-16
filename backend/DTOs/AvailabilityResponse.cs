namespace backend.DTOs;

public class AvailabilityResponse
{
    public bool IsAvailable { get; set; }
    public string Message { get; set; } = "";
    public List<BusySlot> BusySlots { get; set; } = new();
}

public class BusySlot
{
    public int MaLich { get; set; }
    public int? MaPhieu { get; set; }
    public DateOnly Ngay { get; set; }
    public TimeOnly GioBatDau { get; set; }
    public TimeOnly GioKetThuc { get; set; }
}
