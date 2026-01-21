using backend.DTOs;

namespace backend.Services;

/// <summary>
/// Interface định nghĩa các phương thức cho Leave Service
/// </summary>
public interface ILeaveService
{
    Task<List<LeaveRequestDto>> GetAllLeaveRequestsAsync();
    Task<LeaveRequestDto?> GetLeaveRequestByIdAsync(int maDon);
    Task<List<LeaveRequestDto>> GetLeaveRequestsByEmployeeAsync(int maNv);
    Task<List<LeaveRequestDto>> GetLeaveRequestsByStatusAsync(string trangThai);
    Task<int> CreateLeaveRequestAsync(CreateLeaveRequest request);
    Task<bool> ApproveLeaveRequestAsync(int maDon, ApproveLeaveRequest request);
    Task<bool> DeleteLeaveRequestAsync(int maDon);
    
    // Phantom Read Demo Methods
    Task<PhantomReadDemoResult> GetLeaveRequestsWithPhantomReadAsync();
    Task<PhantomReadDemoResult> GetLeaveRequestsFixedPhantomReadAsync();
    //Task<int> CreateLeaveRequestNormalAsync(CreateLeaveRequest request);
    Task<int> CreateLeaveRequestWillBeBlockedAsync(CreateLeaveRequest request);
}
