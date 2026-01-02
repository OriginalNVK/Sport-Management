namespace backend.DTOs;

/// <summary>
/// Response thông tin thanh toán
/// </summary>
public class PaymentResponse
{
    /// <summary>
    /// Mã thanh toán
    /// </summary>
    public int MaTt { get; set; }

    /// <summary>
    /// Mã hóa đơn
    /// </summary>
    public int MaHd { get; set; }

    /// <summary>
    /// Số tiền thanh toán
    /// </summary>
    public decimal SoTien { get; set; }

    /// <summary>
    /// Hình thức thanh toán
    /// </summary>
    public string HinhThuc { get; set; } = string.Empty;

    /// <summary>
    /// Người thanh toán
    /// </summary>
    public string NguoiTt { get; set; } = string.Empty;

    /// <summary>
    /// Ngày thanh toán
    /// </summary>
    public DateTime NgayTt { get; set; }

    /// <summary>
    /// Trạng thái thanh toán
    /// </summary>
    public string TrangThai { get; set; } = string.Empty;

    /// <summary>
    /// Thông báo
    /// </summary>
    public string Message { get; set; } = string.Empty;
}
