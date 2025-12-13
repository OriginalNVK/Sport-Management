namespace backend.Models;

/// <summary>
/// Model đại diện cho bảng tai_khoan trong database
/// </summary>
public class TaiKhoan
{
    public string TenDangNhap { get; set; } = string.Empty;
    public string MatKhau { get; set; } = string.Empty;
    public string VaiTro { get; set; } = string.Empty;
    public int? MaKh { get; set; }
    public int? MaNv { get; set; }
    public bool KichHoat { get; set; }
}
