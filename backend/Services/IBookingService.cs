using backend.DTOs;

namespace backend.Services;

public interface IBookingService
{
    Task<AvailabilityResponse> CheckAvailabilityAsync(CheckFieldAvailabilityRequest request);
    Task<int> CreateBookingAsync(CreateBookingRequest request);
    Task<List<BookingResponse>> GetBookingsByCustomerAsync(int maKh);
    Task<bool> CancelBookingAsync(int maPhieu, string? nguoiHuy);
    Task<List<UserBookingDto>> GetMyBookingsAsync(int? maKh, int? maNv);
    Task<ReceptionistCreatedResponse> GetReceptionistCreatedAsync(int maNv);

		Task<(Guid holdToken, DateTime expiresAt)> HoldSanAsync(HoldSanRequest req);
Task ReleaseHoldAsync(Guid holdToken);
Task<int> ConfirmBookingAsync(ConfirmBookingRequest req);

}
