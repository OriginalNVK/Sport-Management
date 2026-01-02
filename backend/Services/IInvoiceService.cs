using backend.DTOs;

namespace backend.Services;

/// <summary>
/// Interface cho Invoice Service
/// </summary>
public interface IInvoiceService
{
    /// <summary>
    /// Tạo hóa đơn mới từ phiếu đặt sân
    /// </summary>
    /// <param name="request">Thông tin tạo hóa đơn</param>
    /// <returns>Mã hóa đơn đã tạo</returns>
    Task<int> CreateInvoiceAsync(CreateInvoiceRequest request);

    /// <summary>
    /// Lấy thông tin chi tiết hóa đơn
    /// </summary>
    /// <param name="maHd">Mã hóa đơn</param>
    /// <returns>Thông tin hóa đơn</returns>
    Task<InvoiceResponse?> GetInvoiceByIdAsync(int maHd);

    /// <summary>
    /// Lấy danh sách hóa đơn của khách hàng
    /// </summary>
    /// <param name="maKh">Mã khách hàng</param>
    /// <returns>Danh sách hóa đơn</returns>
    Task<List<InvoiceResponse>> GetInvoicesByCustomerAsync(int maKh);

    /// <summary>
    /// Thanh toán hóa đơn
    /// </summary>
    /// <param name="request">Thông tin thanh toán</param>
    /// <returns>Thông tin thanh toán đã tạo</returns>
    Task<PaymentResponse> PayInvoiceAsync(PaymentRequest request);

    /// <summary>
    /// Lấy danh sách tất cả hóa đơn
    /// </summary>
    /// <param name="trangThai">Lọc theo trạng thái thanh toán (optional)</param>
    /// <returns>Danh sách hóa đơn</returns>
    Task<List<InvoiceResponse>> GetAllInvoicesAsync(string? trangThai = null);

    /// <summary>
    /// Hủy hóa đơn
    /// </summary>
    /// <param name="maHd">Mã hóa đơn</param>
    /// <returns>Thành công hay không</returns>
    Task<bool> CancelInvoiceAsync(int maHd);
}
