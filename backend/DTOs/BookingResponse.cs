namespace backend.DTOs;

public class BookingResponse
{
    public int MaPhieu { get; set; }
    public int MaKh { get; set; }
    public int MaSan { get; set; }

    public string? NguoiTaoPhieu { get; set; }
    public DateTime NgayTaoPhieu { get; set; } // DateTime? trong entity -> trả về DateTime

    public DateOnly NgayDat { get; set; }
    public TimeOnly GioBatDau { get; set; }
    public TimeOnly GioKetThuc { get; set; }

    public string HinhThuc { get; set; } = "";
    public string TrangThai { get; set; } = "";
    public decimal TongTien { get; set; }
    public string TinhTrangTt { get; set; } = "";
}
