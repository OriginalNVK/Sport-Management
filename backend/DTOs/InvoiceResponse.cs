namespace backend.DTOs;

/// <summary>
/// Response thông tin hóa đơn
/// </summary>
public class InvoiceResponse
{
    /// <summary>
    /// Mã hóa đơn
    /// </summary>
    public int MaHd { get; set; }

    /// <summary>
    /// Mã phiếu đặt sân
    /// </summary>
    public int MaPhieu { get; set; }

    /// <summary>
    /// Ngày lập hóa đơn
    /// </summary>
    public DateTime NgayLap { get; set; }

    /// <summary>
    /// Tổng tiền gốc
    /// </summary>
    public decimal TongTien { get; set; }

    /// <summary>
    /// Thuế
    /// </summary>
    public decimal Thue { get; set; }

    /// <summary>
    /// Giảm giá
    /// </summary>
    public decimal GiamGia { get; set; }

    /// <summary>
    /// Tổng cuối cùng phải thanh toán
    /// </summary>
    public decimal TongCuoi { get; set; }

    /// <summary>
    /// Tình trạng thanh toán (chua_tt, da_tt, hoan_tien)
    /// </summary>
    public string? TinhTrangTt { get; set; }

    /// <summary>
    /// Thông tin khách hàng
    /// </summary>
    public string? TenKhachHang { get; set; }

    /// <summary>
    /// Thông tin sân
    /// </summary>
    public string? TenSan { get; set; }

    /// <summary>
    /// Ngày đặt sân
    /// </summary>
    public DateOnly? NgayDat { get; set; }

    /// <summary>
    /// Giờ bắt đầu
    /// </summary>
    public TimeOnly? GioBatDau { get; set; }

    /// <summary>
    /// Giờ kết thúc
    /// </summary>
    public TimeOnly? GioKetThuc { get; set; }
}
