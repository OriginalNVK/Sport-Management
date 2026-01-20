namespace backend.DTOs;

public class CreateInvoiceRequest
{
    public int MaPhieu { get; set; }

    /// <summary>
    /// Mã giảm giá dạng string (ví dụ: "SLV5", "GOLD10")
    /// Có thể NULL nếu không áp dụng giảm giá
    /// </summary>
    public string? MaGiamGia { get; set; }

    public decimal PhanTramThue { get; set; } = 10.0m;
}
