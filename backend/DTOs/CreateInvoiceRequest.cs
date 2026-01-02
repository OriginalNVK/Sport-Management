namespace backend.DTOs;

/// <summary>
/// Request để tạo hóa đơn mới
/// </summary>
public class CreateInvoiceRequest
{
    /// <summary>
    /// Mã phiếu đặt sân
    /// </summary>
    public int MaPhieu { get; set; }

    /// <summary>
    /// Danh sách mã ưu đãi áp dụng (optional)
    /// </summary>
    public List<int>? DanhSachMaUuDai { get; set; }

    /// <summary>
    /// Phần trăm thuế (mặc định 10%)
    /// </summary>
    public decimal PhanTramThue { get; set; } = 10.0m;
}
