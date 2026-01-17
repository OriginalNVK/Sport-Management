using backend.DTOs;

namespace backend.Services;

public interface IInvoiceService
{
    Task<int> CreateInvoiceAsync(CreateInvoiceRequest request);

    Task<InvoiceResponse?> GetInvoiceByIdAsync(int maHd);

    Task<List<InvoiceResponse>> GetInvoicesByCustomerAsync(int maKh);

    Task<PaymentResponse> PayInvoiceAsync(PaymentRequest request);

    Task<List<InvoiceResponse>> GetAllInvoicesAsync(string? trangThai = null);

    Task<bool> CancelInvoiceAsync(int maHd);

    Task<InvoiceResponse> UpdateInvoiceAsync(int maHd, string? maGiamGia, bool testRollback = false);

    Task<InvoiceResponse?> GetInvoiceDetailWithRepeatableReadAsync(int maHd);
}
