namespace backend.Models;

/// <summary>
/// Model đại diện cho bảng khach_hang trong database
/// </summary>
public class KhachHang
{
    public int MaKh { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public DateTime? NgaySinh { get; set; }
    public string? GioiTinh { get; set; }
    public string? CmndCccd { get; set; }
    public string? Sdt { get; set; }
    public string? Email { get; set; }
    public string? DiaChi { get; set; }
    public string? HangThanhVien { get; set; }
    public DateTime NgayTao { get; set; }
}
