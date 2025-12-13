namespace backend.Models;

/// <summary>
/// Model đại diện cho bảng nhan_vien trong database
/// </summary>
public class NhanVien
{
    public int MaNv { get; set; }
    public int? MaCoSo { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public DateTime? NgaySinh { get; set; }
    public string? GioiTinh { get; set; }
    public string? CmndCccd { get; set; }
    public string? Sdt { get; set; }
    public string? Email { get; set; }
    public string? DiaChi { get; set; }
    public string? ChucVu { get; set; }
    public decimal? LuongCoBan { get; set; }
    public DateTime NgayTuyen { get; set; }
}
