namespace backend.DTOs;

/// <summary>
/// Request để thanh toán hóa đơn
/// </summary>
public class PaymentRequest
{
    /// <summary>
    /// Mã hóa đơn cần thanh toán
    /// </summary>
    public int MaHd { get; set; }

    /// <summary>
    /// Số tiền thanh toán
    /// </summary>
    public decimal SoTien { get; set; }

    /// <summary>
    /// Hình thức thanh toán: tien_mat, the, vi_dien_tu
    /// </summary>
    public string HinhThuc { get; set; } = "tien_mat";

    /// <summary>
    /// Tên đăng nhập người thực hiện thanh toán
    /// </summary>
    public string NguoiTt { get; set; } = string.Empty;
}
