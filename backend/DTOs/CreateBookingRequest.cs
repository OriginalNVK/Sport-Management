namespace backend.DTOs;

public class CreateBookingRequest
{
    public int MaKh { get; set; }
    public int MaSan { get; set; }
		public string? NguoiTaoPhieu { get; set; } 
    public DateOnly NgayDat { get; set; }
    public TimeOnly GioBatDau { get; set; }
    public TimeOnly GioKetThuc { get; set; }

    public string HinhThuc { get; set; } = "online"; // online, truc_tiep
    public decimal? TongTien { get; set; }
}
