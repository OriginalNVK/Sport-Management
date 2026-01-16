using backend.Data;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

/// <summary>
/// Service xử lý các nghiệp vụ liên quan đến Đơn nghỉ phép
/// </summary>
public class LeaveService : ILeaveService
{
    private readonly SportContext _context;
    private readonly ILogger<LeaveService> _logger;

    public LeaveService(SportContext context, ILogger<LeaveService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<LeaveRequestDto>> GetAllLeaveRequestsAsync()
    {
        try
        {
            var leaveRequests = await _context.DonNghiPheps
                .Include(d => d.MaNvNavigation)
                .ToListAsync();

            return leaveRequests
                .OrderByDescending(d => d.NgayNghi)
                .Select(d => new LeaveRequestDto
                {
                    MaDon = d.MaDon,
                    MaNv = d.MaNv ?? 0,
                    TenNhanVien = d.MaNvNavigation != null ? d.MaNvNavigation.HoTen : null,
                    ChucVu = d.MaNvNavigation != null ? d.MaNvNavigation.ChucVu : null,
                    NgayNghi = d.NgayNghi.HasValue ? d.NgayNghi.Value.ToDateTime(TimeOnly.MinValue) : default(DateTime),
                    LyDo = d.LyDo,
                    TrangThai = d.TrangThai
                })
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting all leave requests: {ex.Message}");
            throw;
        }
    }

    public async Task<LeaveRequestDto?> GetLeaveRequestByIdAsync(int maDon)
    {
        try
        {
            var leaveRequest = await _context.DonNghiPheps
                .Include(d => d.MaNvNavigation)
                .Where(d => d.MaDon == maDon)
                .Select(d => new LeaveRequestDto
                {
                    MaDon = d.MaDon,
                    MaNv = d.MaNv ?? 0,
                    TenNhanVien = d.MaNvNavigation != null ? d.MaNvNavigation.HoTen : null,
                    ChucVu = d.MaNvNavigation != null ? d.MaNvNavigation.ChucVu : null,
                    NgayNghi = d.NgayNghi.HasValue ? d.NgayNghi.Value.ToDateTime(TimeOnly.MinValue) : default(DateTime),
                    LyDo = d.LyDo,
                    TrangThai = d.TrangThai
                })
                .FirstOrDefaultAsync();

            return leaveRequest;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting leave request {maDon}: {ex.Message}");
            throw;
        }
    }

    public async Task<List<LeaveRequestDto>> GetLeaveRequestsByEmployeeAsync(int maNv)
    {
        try
        {
            // Fetch data first to avoid DateOnly translation issues
            var leaveRequests = await _context.DonNghiPheps
                .Include(d => d.MaNvNavigation)
                .Where(d => d.MaNv == maNv)
                .ToListAsync();

            // Sort and convert in memory
            return leaveRequests
                .OrderByDescending(d => d.NgayNghi)
                .Select(d => new LeaveRequestDto
                {
                    MaDon = d.MaDon,
                    MaNv = d.MaNv ?? 0,
                    TenNhanVien = d.MaNvNavigation != null ? d.MaNvNavigation.HoTen : null,
                    ChucVu = d.MaNvNavigation != null ? d.MaNvNavigation.ChucVu : null,
                    NgayNghi = d.NgayNghi.HasValue ? d.NgayNghi.Value.ToDateTime(TimeOnly.MinValue) : default(DateTime),
                    LyDo = d.LyDo,
                    TrangThai = d.TrangThai
                })
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting leave requests for employee {maNv}: {ex.Message}");
            throw;
        }
    }

    public async Task<List<LeaveRequestDto>> GetLeaveRequestsByStatusAsync(string trangThai)
    {
        try
        {
            // Fetch data first to avoid DateOnly translation issues
            var leaveRequests = await _context.DonNghiPheps
                .Include(d => d.MaNvNavigation)
                .Where(d => d.TrangThai == trangThai)
                .ToListAsync();

            // Sort and convert in memory
            return leaveRequests
                .OrderByDescending(d => d.NgayNghi)
                .Select(d => new LeaveRequestDto
                {
                    MaDon = d.MaDon,
                    MaNv = d.MaNv ?? 0,
                    TenNhanVien = d.MaNvNavigation != null ? d.MaNvNavigation.HoTen : null,
                    ChucVu = d.MaNvNavigation != null ? d.MaNvNavigation.ChucVu : null,
                    NgayNghi = d.NgayNghi.HasValue ? d.NgayNghi.Value.ToDateTime(TimeOnly.MinValue) : default(DateTime),
                    LyDo = d.LyDo,
                    TrangThai = d.TrangThai
                })
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting leave requests by status {trangThai}: {ex.Message}");
            throw;
        }
    }

    public async Task<int> CreateLeaveRequestAsync(CreateLeaveRequest request)
    {
        try
        {
            // Kiểm tra nhân viên có tồn tại không
            var employee = await _context.NhanViens.FindAsync(request.MaNv);
            if (employee == null)
            {
                throw new InvalidOperationException("Nhân viên không tồn tại");
            }

            // Kiểm tra ngày nghỉ phải từ hiện tại trở đi
            if (request.NgayNghi.Date < DateTime.Now.Date)
            {
                throw new InvalidOperationException("Ngày nghỉ phải từ hôm nay trở đi");
            }

            var leaveRequest = new DonNghiPhep
            {
                MaNv = request.MaNv,
                NgayNghi = DateOnly.FromDateTime(request.NgayNghi),
                LyDo = request.LyDo,
                TrangThai = "cho_duyet" // Mặc định là chờ duyệt
            };

            _context.DonNghiPheps.Add(leaveRequest);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Leave request created successfully with ID: {leaveRequest.MaDon}");
            return leaveRequest.MaDon;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error creating leave request: {ex.Message}");
            throw;
        }
    }

    public async Task<bool> ApproveLeaveRequestAsync(int maDon, ApproveLeaveRequest request)
    {
        try
        {
            var leaveRequest = await _context.DonNghiPheps.FindAsync(maDon);
            if (leaveRequest == null)
            {
                throw new InvalidOperationException("Đơn nghỉ phép không tồn tại");
            }

            // Kiểm tra trạng thái hiện tại
            if (leaveRequest.TrangThai != "cho_duyet")
            {
                throw new InvalidOperationException("Đơn nghỉ phép đã được xử lý");
            }

            leaveRequest.TrangThai = request.TrangThai;
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Leave request {maDon} updated to status: {request.TrangThai}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error approving leave request {maDon}: {ex.Message}");
            throw;
        }
    }

    public async Task<bool> DeleteLeaveRequestAsync(int maDon)
    {
        try
        {
            var leaveRequest = await _context.DonNghiPheps.FindAsync(maDon);
            if (leaveRequest == null)
            {
                throw new InvalidOperationException("Đơn nghỉ phép không tồn tại");
            }

            // Chỉ cho phép xóa đơn chưa duyệt hoặc bị từ chối
            if (leaveRequest.TrangThai == "da_duyet")
            {
                throw new InvalidOperationException("Không thể xóa đơn nghỉ phép đã được duyệt");
            }

            _context.DonNghiPheps.Remove(leaveRequest);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Leave request {maDon} deleted successfully");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error deleting leave request {maDon}: {ex.Message}");
            throw;
        }
    }
}
