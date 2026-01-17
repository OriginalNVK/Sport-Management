namespace backend.DTOs;

/// <summary>
/// DTO cho thông tin booking của user
/// </summary>
public class UserBookingDto
{
    public int MaPhieu { get; set; }
    public int? MaHoaDon { get; set; }
    public string DisplayText { get; set; } = string.Empty;
    public DateOnly? NgayDat { get; set; }
    public TimeOnly? GioBatDau { get; set; }
    public TimeOnly? GioKetThuc { get; set; }
    public string? TrangThai { get; set; }
    public decimal? TongTien { get; set; }
    public string? TinhTrangTt { get; set; }

    /// <summary>
    /// Danh sách dịch vụ (tên + số lượng + đơn vị) khi phiếu chưa thanh toán
    /// Ví dụ: "Nước suối x2 chai, Khăn tắm x1 cái"
    /// </summary>
    public string? DanhSachDichVu { get; set; }
}
