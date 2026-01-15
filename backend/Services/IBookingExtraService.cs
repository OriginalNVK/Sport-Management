using backend.DTOs;

namespace backend.Services;

public interface IBookingExtrasService
{
    Task<ChiTietDvResponse> AddChiTietDvAsync(AddChiTietDvRequest req);
    Task<LichHlvResponse> AddLichHlvAsync(AddLichHlvRequest req);

    Task<List<ChiTietDvResponse>> GetChiTietDvByPhieuAsync(int ma_phieu);
    Task<List<LichHlvResponse>> GetLichHlvByPhieuAsync(int ma_phieu);

    Task<bool> DeleteChiTietDvAsync(int ma_ct);
    Task<bool> DeleteLichHlvAsync(int ma_lich);
    Task<ServiceInfoResponse?> GetServiceInfoAsync(int maDv, int? maCoSo);
    Task<List<ServiceInfoResponse>> GetServiceListAsync();

}
