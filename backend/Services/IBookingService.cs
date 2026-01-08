using backend.DTOs;

namespace backend.Services;

public interface IBookingService
{
    Task<AvailabilityResponse> CheckAvailabilityAsync(CheckFieldAvailabilityRequest request);
    Task<int> CreateBookingAsync(CreateBookingRequest request, string? nguoiTaoPhieu);
    Task<List<BookingResponse>> GetBookingsByCustomerAsync(int maKh);
    Task<bool> CancelBookingAsync(int maPhieu, string? nguoiHuy);
}
