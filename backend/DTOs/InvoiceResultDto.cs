namespace backend.DTOs;

/// <summary>
/// DTO để nhận kết quả từ stored procedure sp_TaoHoaDon
/// </summary>
public class InvoiceResultDto
{
    public int MaHd { get; set; }
    public int MaPhieu { get; set; }
    public DateTime NgayLap { get; set; }
    public decimal TongTien { get; set; }
    public decimal GiamGia { get; set; }
    public decimal Thue { get; set; }
    public decimal TongCuoi { get; set; }
    public string TenKhachHang { get; set; } = string.Empty;
    public string? HangThanhVien { get; set; }
}
