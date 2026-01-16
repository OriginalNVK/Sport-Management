using backend.Data;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

/// <summary>
/// Service xử lý các nghiệp vụ liên quan đến Ca trực và Phân công ca
/// </summary>
public class ShiftService : IShiftService
{
    private readonly SportContext _context;
    private readonly ILogger<ShiftService> _logger;

    public ShiftService(SportContext context, ILogger<ShiftService> logger)
    {
        _context = context;
        _logger = logger;
    }

    #region Shift Management

    public async Task<List<ShiftDto>> GetAllShiftsAsync()
    {
        try
        {
            var shifts = await _context.CaTrucs
                .Include(ct => ct.MaCoSoNavigation)
                .ToListAsync();

            return shifts
                .OrderBy(ct => ct.Ngay)
                .ThenBy(ct => ct.GioBatDau)
                .Select(ct => new ShiftDto
                {
                    MaCa = ct.MaCa,
                    MaCoSo = ct.MaCoSo ?? 0,
                    TenCoSo = ct.MaCoSoNavigation != null ? ct.MaCoSoNavigation.TenCoSo : null,
                    Ngay = ct.Ngay.HasValue ? ct.Ngay.Value.ToDateTime(TimeOnly.MinValue) : default,
                    GioBatDau = ct.GioBatDau.HasValue ? ct.GioBatDau.Value.ToTimeSpan() : default,
                    GioKetThuc = ct.GioKetThuc.HasValue ? ct.GioKetThuc.Value.ToTimeSpan() : default,
                    TenCa = ct.TenCa
                })
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting all shifts: {ex.Message}");
            throw;
        }
    }

    public async Task<ShiftDto?> GetShiftByIdAsync(int maCa)
    {
        try
        {
            var shift = await _context.CaTrucs
                .Include(ct => ct.MaCoSoNavigation)
                .Where(ct => ct.MaCa == maCa)
                .Select(ct => new ShiftDto
                {
                    MaCa = ct.MaCa,
                    MaCoSo = ct.MaCoSo ?? 0,
                    TenCoSo = ct.MaCoSoNavigation != null ? ct.MaCoSoNavigation.TenCoSo : null,
                    Ngay = ct.Ngay.HasValue ? ct.Ngay.Value.ToDateTime(TimeOnly.MinValue) : default,
                    GioBatDau = ct.GioBatDau.HasValue ? ct.GioBatDau.Value.ToTimeSpan() : default,
                    GioKetThuc = ct.GioKetThuc.HasValue ? ct.GioKetThuc.Value.ToTimeSpan() : default,
                    TenCa = ct.TenCa
                })
                .FirstOrDefaultAsync();

            return shift;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting shift {maCa}: {ex.Message}");
            throw;
        }
    }

    public async Task<List<ShiftDto>> GetShiftsByCoSoAsync(int maCoSo)
    {
        try
        {
            var shifts = await _context.CaTrucs
                .Include(ct => ct.MaCoSoNavigation)
                .Where(ct => ct.MaCoSo == maCoSo)
                .ToListAsync();

            return shifts
                .OrderBy(ct => ct.Ngay)
                .ThenBy(ct => ct.GioBatDau)
                .Select(ct => new ShiftDto
                {
                    MaCa = ct.MaCa,
                    MaCoSo = ct.MaCoSo ?? 0,
                    TenCoSo = ct.MaCoSoNavigation != null ? ct.MaCoSoNavigation.TenCoSo : null,
                    Ngay = ct.Ngay.HasValue ? ct.Ngay.Value.ToDateTime(TimeOnly.MinValue) : default,
                    GioBatDau = ct.GioBatDau.HasValue ? ct.GioBatDau.Value.ToTimeSpan() : default,
                    GioKetThuc = ct.GioKetThuc.HasValue ? ct.GioKetThuc.Value.ToTimeSpan() : default,
                    TenCa = ct.TenCa
                })
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting shifts for facility {maCoSo}: {ex.Message}");
            throw;
        }
    }

    public async Task<List<ShiftDto>> GetShiftsByDateAsync(DateTime date)
    {
        try
        {
            var shifts = await _context.CaTrucs
                .Include(ct => ct.MaCoSoNavigation)
                .Where(ct => ct.Ngay.HasValue && ct.Ngay.Value == DateOnly.FromDateTime(date))
                .ToListAsync();

            return shifts
                .OrderBy(ct => ct.GioBatDau)
                .Select(ct => new ShiftDto
                {
                    MaCa = ct.MaCa,
                    MaCoSo = ct.MaCoSo ?? 0,
                    TenCoSo = ct.MaCoSoNavigation != null ? ct.MaCoSoNavigation.TenCoSo : null,
                    Ngay = ct.Ngay.HasValue ? ct.Ngay.Value.ToDateTime(TimeOnly.MinValue) : default,
                    GioBatDau = ct.GioBatDau.HasValue ? ct.GioBatDau.Value.ToTimeSpan() : default,
                    GioKetThuc = ct.GioKetThuc.HasValue ? ct.GioKetThuc.Value.ToTimeSpan() : default,
                    TenCa = ct.TenCa
                })
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting shifts for date {date}: {ex.Message}");
            throw;
        }
    }

    public async Task<int> CreateShiftAsync(CreateShiftRequest request)
    {
        try
        {
            // Kiểm tra cơ sở có tồn tại không
            var coSo = await _context.CoSos.FindAsync(request.MaCoSo);
            if (coSo == null)
            {
                throw new InvalidOperationException("Cơ sở không tồn tại");
            }

            // Kiểm tra giờ hợp lệ
            if (request.GioBatDau >= request.GioKetThuc)
            {
                throw new InvalidOperationException("Giờ bắt đầu phải nhỏ hơn giờ kết thúc");
            }

            // Tạo mã ca mới
            var maxMaCa = await _context.CaTrucs.MaxAsync(ct => (int?)ct.MaCa) ?? 0;
            var newMaCa = maxMaCa + 1;

            var shift = new CaTruc
            {
                MaCa = newMaCa,
                MaCoSo = request.MaCoSo,
                Ngay = DateOnly.FromDateTime(request.Ngay),
                GioBatDau = TimeOnly.FromTimeSpan(request.GioBatDau),
                GioKetThuc = TimeOnly.FromTimeSpan(request.GioKetThuc),
                TenCa = request.TenCa
            };

            _context.CaTrucs.Add(shift);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Shift created successfully with ID: {newMaCa}");
            return newMaCa;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error creating shift: {ex.Message}");
            throw;
        }
    }

    public async Task<bool> UpdateShiftAsync(int maCa, UpdateShiftRequest request)
    {
        try
        {
            var shift = await _context.CaTrucs.FindAsync(maCa);
            if (shift == null)
            {
                throw new InvalidOperationException("Ca trực không tồn tại");
            }

            // Cập nhật các trường nếu có giá trị mới
            if (request.Ngay.HasValue)
                shift.Ngay = DateOnly.FromDateTime(request.Ngay.Value);


            if (request.GioBatDau.HasValue)
                shift.GioBatDau = TimeOnly.FromTimeSpan(request.GioBatDau.Value);

            if (request.GioKetThuc.HasValue)
                shift.GioKetThuc = TimeOnly.FromTimeSpan(request.GioKetThuc.Value);


            // Kiểm tra giờ hợp lệ sau khi cập nhật
            if (shift.GioBatDau >= shift.GioKetThuc)
            {
                throw new InvalidOperationException("Giờ bắt đầu phải nhỏ hơn giờ kết thúc");
            }

            if (!string.IsNullOrEmpty(request.TenCa))
                shift.TenCa = request.TenCa;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Shift {maCa} updated successfully");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating shift {maCa}: {ex.Message}");
            throw;
        }
    }

    public async Task<bool> DeleteShiftAsync(int maCa)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var shift = await _context.CaTrucs.FindAsync(maCa);
            if (shift == null)
            {
                throw new InvalidOperationException("Ca trực không tồn tại");
            }

            // Xóa các phân công ca liên quan
            var assignments = await _context.PhanCongCas.Where(pc => pc.MaCa == maCa).ToListAsync();
            _context.PhanCongCas.RemoveRange(assignments);

            // Xóa ca trực
            _context.CaTrucs.Remove(shift);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            _logger.LogInformation($"Shift {maCa} deleted successfully");
            return true;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError($"Error deleting shift {maCa}: {ex.Message}");
            throw;
        }
    }

    #endregion

    #region Shift Assignment

    public async Task<List<ShiftAssignmentDto>> GetAllShiftAssignmentsAsync()
    {
        try
        {
            var assignments = await _context.PhanCongCas
                .Include(pc => pc.MaNvNavigation)
                .Include(pc => pc.MaCaNavigation)
                .ThenInclude(ca => ca.MaCoSoNavigation)
                .ToListAsync();

            return assignments
                .OrderBy(pc => pc.MaCaNavigation?.Ngay)
                .ThenBy(pc => pc.MaCaNavigation?.GioBatDau)
                .Select(pc => new ShiftAssignmentDto
                {
                    MaPc = pc.MaPc,
                    MaNv = pc.MaNv ?? 0,
                    TenNhanVien = pc.MaNvNavigation != null ? pc.MaNvNavigation.HoTen : null,
                    ChucVu = pc.MaNvNavigation != null ? pc.MaNvNavigation.ChucVu : null,
                    MaCa = pc.MaCa ?? 0,
                    TenCa = pc.MaCaNavigation != null ? pc.MaCaNavigation.TenCa : null,
                    Ngay = pc.MaCaNavigation != null && pc.MaCaNavigation.Ngay.HasValue
                        ? pc.MaCaNavigation.Ngay.Value.ToDateTime(TimeOnly.MinValue)
                        : null,
                    GioBatDau = pc.MaCaNavigation != null && pc.MaCaNavigation.GioBatDau.HasValue
                        ? pc.MaCaNavigation.GioBatDau.Value.ToTimeSpan()
                        : null,
                    GioKetThuc = pc.MaCaNavigation != null && pc.MaCaNavigation.GioKetThuc.HasValue
                        ? pc.MaCaNavigation.GioKetThuc.Value.ToTimeSpan()
                        : null,
                })
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting all shift assignments: {ex.Message}");
            throw;
        }
    }

    public async Task<List<ShiftAssignmentDto>> GetShiftAssignmentsByEmployeeAsync(int maNv)
    {
        try
        {
            var assignments = await _context.PhanCongCas
                .Include(pc => pc.MaNvNavigation)
                .Include(pc => pc.MaCaNavigation)
                .Where(pc => pc.MaNv == maNv)
                .ToListAsync();

            return assignments
                .OrderBy(pc => pc.MaCaNavigation?.Ngay)
                .ThenBy(pc => pc.MaCaNavigation?.GioBatDau)
                .Select(pc => new ShiftAssignmentDto
                {
                    MaPc = pc.MaPc,
                    MaNv = pc.MaNv ?? 0,
                    TenNhanVien = pc.MaNvNavigation != null ? pc.MaNvNavigation.HoTen : null,
                    ChucVu = pc.MaNvNavigation != null ? pc.MaNvNavigation.ChucVu : null,
                    MaCa = pc.MaCa ?? 0,
                    TenCa = pc.MaCaNavigation != null ? pc.MaCaNavigation.TenCa : null,
                    Ngay = pc.MaCaNavigation != null && pc.MaCaNavigation.Ngay.HasValue
                        ? pc.MaCaNavigation.Ngay.Value.ToDateTime(TimeOnly.MinValue)
                        : null,
                    GioBatDau = pc.MaCaNavigation != null && pc.MaCaNavigation.GioBatDau.HasValue
                        ? pc.MaCaNavigation.GioBatDau.Value.ToTimeSpan()
                        : null,
                    GioKetThuc = pc.MaCaNavigation != null && pc.MaCaNavigation.GioKetThuc.HasValue
                        ? pc.MaCaNavigation.GioKetThuc.Value.ToTimeSpan()
                        : null,
                })
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting shift assignments for employee {maNv}: {ex.Message}");
            throw;
        }
    }

    public async Task<List<ShiftAssignmentDto>> GetShiftAssignmentsByShiftAsync(int maCa)
    {
        try
        {
            var assignments = await _context.PhanCongCas
                .Include(pc => pc.MaNvNavigation)
                .Include(pc => pc.MaCaNavigation)
                .Where(pc => pc.MaCa == maCa)
                .ToListAsync();

            return assignments
                .Select(pc => new ShiftAssignmentDto
                {
                    MaPc = pc.MaPc,
                    MaNv = pc.MaNv ?? 0,
                    TenNhanVien = pc.MaNvNavigation != null ? pc.MaNvNavigation.HoTen : null,
                    ChucVu = pc.MaNvNavigation != null ? pc.MaNvNavigation.ChucVu : null,
                    MaCa = pc.MaCa ?? 0,
                    TenCa = pc.MaCaNavigation != null ? pc.MaCaNavigation.TenCa : null,
                    Ngay = pc.MaCaNavigation != null && pc.MaCaNavigation.Ngay.HasValue
                        ? pc.MaCaNavigation.Ngay.Value.ToDateTime(TimeOnly.MinValue)
                        : null,
                    GioBatDau = pc.MaCaNavigation != null && pc.MaCaNavigation.GioBatDau.HasValue
                        ? pc.MaCaNavigation.GioBatDau.Value.ToTimeSpan()
                        : null,
                    GioKetThuc = pc.MaCaNavigation != null && pc.MaCaNavigation.GioKetThuc.HasValue
                        ? pc.MaCaNavigation.GioKetThuc.Value.ToTimeSpan()
                        : null,
                })
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting shift assignments for shift {maCa}: {ex.Message}");
            throw;
        }
    }

    public async Task<int> AssignShiftAsync(AssignShiftRequest request)
    {
        try
        {
            // Kiểm tra nhân viên có tồn tại không
            var employee = await _context.NhanViens.FindAsync(request.MaNv);
            if (employee == null)
            {
                throw new InvalidOperationException("Nhân viên không tồn tại");
            }

            // Kiểm tra ca trực có tồn tại không
            var shift = await _context.CaTrucs.FindAsync(request.MaCa);
            if (shift == null)
            {
                throw new InvalidOperationException("Ca trực không tồn tại");
            }

            // Kiểm tra nhân viên đã được phân công ca này chưa
            var existingAssignment = await _context.PhanCongCas
                .FirstOrDefaultAsync(pc => pc.MaNv == request.MaNv && pc.MaCa == request.MaCa);

            if (existingAssignment != null)
            {
                throw new InvalidOperationException("Nhân viên đã được phân công ca này");
            }

            // Tạo mã phân công mới
            var maxMaPc = await _context.PhanCongCas.MaxAsync(pc => (int?)pc.MaPc) ?? 0;
            var newMaPc = maxMaPc + 1;

            var assignment = new PhanCongCa
            {
                MaPc = newMaPc,
                MaNv = request.MaNv,
                MaCa = request.MaCa
            };

            _context.PhanCongCas.Add(assignment);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Shift assignment created successfully with ID: {newMaPc}");
            return newMaPc;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error assigning shift: {ex.Message}");
            throw;
        }
    }

    public async Task<bool> RemoveShiftAssignmentAsync(int maPc)
    {
        try
        {
            var assignment = await _context.PhanCongCas.FindAsync(maPc);
            if (assignment == null)
            {
                throw new InvalidOperationException("Phân công ca không tồn tại");
            }

            _context.PhanCongCas.Remove(assignment);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Shift assignment {maPc} removed successfully");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error removing shift assignment {maPc}: {ex.Message}");
            throw;
        }
    }

    #endregion
}
