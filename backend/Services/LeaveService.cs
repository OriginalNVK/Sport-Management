using backend.Data;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Data;

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

    // =============================================
    // PHANTOM READ DEMO METHODS
    // =============================================

    public async Task<PhantomReadDemoResult> GetLeaveRequestsWithPhantomReadAsync()
    {
        var result = new PhantomReadDemoResult
        {
            StartTime = DateTime.Now,
            Message = "Demo Phantom Read (CÓ LỖI) - Đọc 2 lần với delay 5 giây"
        };

        try
        {
            using (var connection = _context.Database.GetDbConnection())
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "sp_GetLeaveRequests_WithPhantomRead";
                    command.CommandType = System.Data.CommandType.StoredProcedure;
                    command.CommandTimeout = 30;

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        // Đọc kết quả lần 1
                        while (await reader.ReadAsync())
                        {
                            result.LanDoc1.Add(new LeaveRequestDto
                            {
                                MaDon = reader.GetInt32(0),
                                MaNv = reader.GetInt32(1),
                                TenNhanVien = reader.IsDBNull(2) ? null : reader.GetString(2),
                                ChucVu = reader.IsDBNull(3) ? null : reader.GetString(3),
                                NgayNghi = reader.GetDateTime(4),
                                LyDo = reader.IsDBNull(5) ? null : reader.GetString(5),
                                TrangThai = reader.IsDBNull(6) ? null : reader.GetString(6)
                            });
                        }

                        // Chuyển sang result set tiếp theo (lần đọc 2)
                        await reader.NextResultAsync();
                        while (await reader.ReadAsync())
                        {
                            result.LanDoc2.Add(new LeaveRequestDto
                            {
                                MaDon = reader.GetInt32(0),
                                MaNv = reader.GetInt32(1),
                                TenNhanVien = reader.IsDBNull(2) ? null : reader.GetString(2),
                                ChucVu = reader.IsDBNull(3) ? null : reader.GetString(3),
                                NgayNghi = reader.GetDateTime(4),
                                LyDo = reader.IsDBNull(5) ? null : reader.GetString(5),
                                TrangThai = reader.IsDBNull(6) ? null : reader.GetString(6)
                            });
                        }
                    }
                }
            }

            result.EndTime = DateTime.Now;
            result.HasPhantomRead = result.LanDoc2.Count > result.LanDoc1.Count;
            
            if (result.HasPhantomRead)
            {
                result.Message += $" | ⚠️ PHANTOM READ DETECTED: Lần 1 có {result.LanDoc1.Count} đơn, lần 2 có {result.LanDoc2.Count} đơn";
            }
            else
            {
                result.Message += $" | ✓ Không phát hiện phantom read (cả 2 lần đều có {result.LanDoc1.Count} đơn)";
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error in GetLeaveRequestsWithPhantomReadAsync: {ex.Message}");
            throw;
        }
    }

    public async Task<PhantomReadDemoResult> GetLeaveRequestsFixedPhantomReadAsync()
    {
        var result = new PhantomReadDemoResult
        {
            StartTime = DateTime.Now,
            Message = "Demo ĐÃ FIX Phantom Read - Sử dụng SERIALIZABLE isolation level"
        };

        try
        {
            using (var connection = _context.Database.GetDbConnection())
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "sp_GetLeaveRequests_FixedPhantomRead";
                    command.CommandType = System.Data.CommandType.StoredProcedure;
                    command.CommandTimeout = 30;

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        // Đọc kết quả lần 1
                        while (await reader.ReadAsync())
                        {
                            result.LanDoc1.Add(new LeaveRequestDto
                            {
                                MaDon = reader.GetInt32(0),
                                MaNv = reader.GetInt32(1),
                                TenNhanVien = reader.IsDBNull(2) ? null : reader.GetString(2),
                                ChucVu = reader.IsDBNull(3) ? null : reader.GetString(3),
                                NgayNghi = reader.GetDateTime(4),
                                LyDo = reader.IsDBNull(5) ? null : reader.GetString(5),
                                TrangThai = reader.IsDBNull(6) ? null : reader.GetString(6)
                            });
                        }

                        // Chuyển sang result set tiếp theo (lần đọc 2)
                        await reader.NextResultAsync();
                        while (await reader.ReadAsync())
                        {
                            result.LanDoc2.Add(new LeaveRequestDto
                            {
                                MaDon = reader.GetInt32(0),
                                MaNv = reader.GetInt32(1),
                                TenNhanVien = reader.IsDBNull(2) ? null : reader.GetString(2),
                                ChucVu = reader.IsDBNull(3) ? null : reader.GetString(3),
                                NgayNghi = reader.GetDateTime(4),
                                LyDo = reader.IsDBNull(5) ? null : reader.GetString(5),
                                TrangThai = reader.IsDBNull(6) ? null : reader.GetString(6)
                            });
                        }
                    }
                }
            }

            result.EndTime = DateTime.Now;
            result.HasPhantomRead = result.LanDoc2.Count > result.LanDoc1.Count;
            
            result.Message += $" | ✓ ĐÃ FIX: Lần 1 có {result.LanDoc1.Count} đơn, lần 2 có {result.LanDoc2.Count} đơn (không thay đổi)";

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error in GetLeaveRequestsFixedPhantomReadAsync: {ex.Message}");
            throw;
        }
    }

    public async Task<int> CreateLeaveRequestNormalAsync(CreateLeaveRequest request)
    {
        try
        {
            using (var connection = _context.Database.GetDbConnection())
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "sp_CreateLeaveRequest_Normal";
                    command.CommandType = System.Data.CommandType.StoredProcedure;

                    // Add parameters
                    var paramMaNv = command.CreateParameter();
                    paramMaNv.ParameterName = "@MaNv";
                    paramMaNv.Value = request.MaNv;
                    command.Parameters.Add(paramMaNv);

                    var paramNgayNghi = command.CreateParameter();
                    paramNgayNghi.ParameterName = "@NgayNghi";
                    paramNgayNghi.Value = request.NgayNghi.Date;
                    command.Parameters.Add(paramNgayNghi);

                    var paramLyDo = command.CreateParameter();
                    paramLyDo.ParameterName = "@LyDo";
                    paramLyDo.Value = request.LyDo;
                    command.Parameters.Add(paramLyDo);

                    var paramOutput = command.CreateParameter();
                    paramOutput.ParameterName = "@MaDonOutput";
                    paramOutput.Direction = System.Data.ParameterDirection.Output;
                    paramOutput.DbType = System.Data.DbType.Int32;
                    command.Parameters.Add(paramOutput);

                    await command.ExecuteNonQueryAsync();

                    return (int)paramOutput.Value;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error in CreateLeaveRequestNormalAsync: {ex.Message}");
            throw;
        }
    }

    public async Task<int> CreateLeaveRequestWillBeBlockedAsync(CreateLeaveRequest request)
    {
        try
        {
            using (var connection = _context.Database.GetDbConnection())
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "sp_CreateLeaveRequest_WillBeBlocked";
                    command.CommandType = System.Data.CommandType.StoredProcedure;
                    command.CommandTimeout = 30; // Timeout 30 giây để chờ lock

                    // Add parameters
                    var paramMaNv = command.CreateParameter();
                    paramMaNv.ParameterName = "@MaNv";
                    paramMaNv.Value = request.MaNv;
                    command.Parameters.Add(paramMaNv);

                    var paramNgayNghi = command.CreateParameter();
                    paramNgayNghi.ParameterName = "@NgayNghi";
                    paramNgayNghi.Value = request.NgayNghi.Date;
                    command.Parameters.Add(paramNgayNghi);

                    var paramLyDo = command.CreateParameter();
                    paramLyDo.ParameterName = "@LyDo";
                    paramLyDo.Value = request.LyDo;
                    command.Parameters.Add(paramLyDo);

                    var paramOutput = command.CreateParameter();
                    paramOutput.ParameterName = "@MaDonOutput";
                    paramOutput.Direction = System.Data.ParameterDirection.Output;
                    paramOutput.DbType = System.Data.DbType.Int32;
                    command.Parameters.Add(paramOutput);

                    await command.ExecuteNonQueryAsync();

                    return (int)paramOutput.Value;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error in CreateLeaveRequestWillBeBlockedAsync: {ex.Message}");
            throw;
        }
    }
}
