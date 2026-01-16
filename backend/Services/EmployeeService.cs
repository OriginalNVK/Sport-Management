using backend.Data;
using backend.DTOs;
using backend.Helpers;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

/// <summary>
/// Service xử lý các nghiệp vụ liên quan đến Nhân viên
/// </summary>
public class EmployeeService : IEmployeeService
{
    private readonly SportContext _context;
    private readonly ILogger<EmployeeService> _logger;

    public EmployeeService(SportContext context, ILogger<EmployeeService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<EmployeeDto>> GetAllEmployeesAsync()
    {
        try
        {
            var employees = await _context.NhanViens
                .Include(nv => nv.MaCoSoNavigation)
                .Include(nv => nv.TaiKhoans)
                .Select(nv => new EmployeeDto
                {
                    MaNv = nv.MaNv,
                    MaCoSo = nv.MaCoSo ?? 0,
                    TenCoSo = nv.MaCoSoNavigation != null ? nv.MaCoSoNavigation.TenCoSo : null,
                    HoTen = nv.HoTen,
                    NgaySinh = nv.NgaySinh.HasValue ? nv.NgaySinh.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null,
                    GioiTinh = nv.GioiTinh,
                    CmndCccd = nv.CmndCccd,
                    Sdt = nv.Sdt,
                    Email = nv.Email,
                    DiaChi = nv.DiaChi,
                    ChucVu = nv.ChucVu,
                    LuongCoBan = nv.LuongCoBan,
                    NgayTuyen = nv.NgayTuyen,
                    TenDangNhap = nv.TaiKhoans.FirstOrDefault() != null ? nv.TaiKhoans.FirstOrDefault()!.TenDangNhap : null,
                    VaiTro = nv.TaiKhoans.FirstOrDefault() != null ? nv.TaiKhoans.FirstOrDefault()!.VaiTro : null,
                    KichHoat = nv.TaiKhoans.FirstOrDefault() != null ? nv.TaiKhoans.FirstOrDefault()!.KichHoat : null
                })
                .ToListAsync();

            return employees;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting all employees: {ex.Message}");
            throw;
        }
    }

    public async Task<EmployeeDto?> GetEmployeeByIdAsync(int maNv)
    {
        try
        {
            var employee = await _context.NhanViens
                .Include(nv => nv.MaCoSoNavigation)
                .Include(nv => nv.TaiKhoans)
                .Where(nv => nv.MaNv == maNv)
                .Select(nv => new EmployeeDto
                {
                    MaNv = nv.MaNv,
                    MaCoSo = nv.MaCoSo ?? 0,
                    TenCoSo = nv.MaCoSoNavigation != null ? nv.MaCoSoNavigation.TenCoSo : null,
                    HoTen = nv.HoTen,
                    NgaySinh = nv.NgaySinh.HasValue ? nv.NgaySinh.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null,
                    GioiTinh = nv.GioiTinh,
                    CmndCccd = nv.CmndCccd,
                    Sdt = nv.Sdt,
                    Email = nv.Email,
                    DiaChi = nv.DiaChi,
                    ChucVu = nv.ChucVu,
                    LuongCoBan = nv.LuongCoBan,
                    NgayTuyen = nv.NgayTuyen,
                    TenDangNhap = nv.TaiKhoans.FirstOrDefault() != null ? nv.TaiKhoans.FirstOrDefault()!.TenDangNhap : null,
                    VaiTro = nv.TaiKhoans.FirstOrDefault() != null ? nv.TaiKhoans.FirstOrDefault()!.VaiTro : null,
                    KichHoat = nv.TaiKhoans.FirstOrDefault() != null ? nv.TaiKhoans.FirstOrDefault()!.KichHoat : null
                })
                .FirstOrDefaultAsync();

            return employee;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting employee {maNv}: {ex.Message}");
            throw;
        }
    }

    public async Task<List<EmployeeDto>> GetEmployeesByCoSoAsync(int maCoSo)
    {
        try
        {
            var employees = await _context.NhanViens
                .Include(nv => nv.MaCoSoNavigation)
                .Include(nv => nv.TaiKhoans)
                .Where(nv => nv.MaCoSo == maCoSo)
                .Select(nv => new EmployeeDto
                {
                    MaNv = nv.MaNv,
                    MaCoSo = nv.MaCoSo ?? 0,
                    TenCoSo = nv.MaCoSoNavigation != null ? nv.MaCoSoNavigation.TenCoSo : null,
                    HoTen = nv.HoTen,
                    NgaySinh = nv.NgaySinh.HasValue ? nv.NgaySinh.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null,
                    GioiTinh = nv.GioiTinh,
                    CmndCccd = nv.CmndCccd,
                    Sdt = nv.Sdt,
                    Email = nv.Email,
                    DiaChi = nv.DiaChi,
                    ChucVu = nv.ChucVu,
                    LuongCoBan = nv.LuongCoBan,
                    NgayTuyen = nv.NgayTuyen,
                    TenDangNhap = nv.TaiKhoans.FirstOrDefault() != null ? nv.TaiKhoans.FirstOrDefault()!.TenDangNhap : null,
                    VaiTro = nv.TaiKhoans.FirstOrDefault() != null ? nv.TaiKhoans.FirstOrDefault()!.VaiTro : null,
                    KichHoat = nv.TaiKhoans.FirstOrDefault() != null ? nv.TaiKhoans.FirstOrDefault()!.KichHoat : null
                })
                .ToListAsync();

            return employees;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting employees for facility {maCoSo}: {ex.Message}");
            throw;
        }
    }

    public async Task<int> CreateEmployeeAsync(CreateEmployeeRequest request)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Kiểm tra tên đăng nhập đã tồn tại chưa
            var existingAccount = await _context.TaiKhoans
                .FirstOrDefaultAsync(tk => tk.TenDangNhap == request.TenDangNhap);

            if (existingAccount != null)
            {
                throw new InvalidOperationException("Tên đăng nhập đã tồn tại");
            }

            // Kiểm tra cơ sở có tồn tại không
            var coSo = await _context.CoSos.FindAsync(request.MaCoSo);
            if (coSo == null)
            {
                throw new InvalidOperationException("Cơ sở không tồn tại");
            }

            // Tạo mã nhân viên mới
            var maxMaNv = await _context.NhanViens.MaxAsync(nv => (int?)nv.MaNv) ?? 0;
            var newMaNv = maxMaNv + 1;

            // Tạo nhân viên mới
            var employee = new NhanVien
            {
                MaNv = newMaNv,
                MaCoSo = request.MaCoSo,
                HoTen = request.HoTen,
                NgaySinh = request.NgaySinh.HasValue ? DateOnly.FromDateTime(request.NgaySinh.Value) : (DateOnly?)null,
                GioiTinh = request.GioiTinh,
                CmndCccd = request.CmndCccd,
                Sdt = request.Sdt,
                Email = request.Email,
                DiaChi = request.DiaChi,
                ChucVu = request.ChucVu,
                LuongCoBan = request.LuongCoBan,
                NgayTuyen = DateTime.Now
            };

            _context.NhanViens.Add(employee);
            await _context.SaveChangesAsync();

            // Tạo tài khoản
            var account = new TaiKhoan
            {
                TenDangNhap = request.TenDangNhap,
                MatKhau = MD5Helper.HashPassword(request.MatKhau),
                VaiTro = request.VaiTro ?? "nhanvien_bt",
                MaNv = newMaNv,
                KichHoat = true
            };

            _context.TaiKhoans.Add(account);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            _logger.LogInformation($"Employee created successfully with ID: {newMaNv}");
            return newMaNv;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError($"Error creating employee: {ex.Message}");
            throw;
        }
    }

    public async Task<bool> UpdateEmployeeAsync(int maNv, UpdateEmployeeRequest request)
    {
        try
        {
            var employee = await _context.NhanViens.FindAsync(maNv);
            if (employee == null)
            {
                throw new InvalidOperationException("Nhân viên không tồn tại");
            }

            // Cập nhật các trường nếu có giá trị mới
            if (request.MaCoSo.HasValue)
            {
                var coSo = await _context.CoSos.FindAsync(request.MaCoSo.Value);
                if (coSo == null)
                {
                    throw new InvalidOperationException("Cơ sở không tồn tại");
                }
                employee.MaCoSo = request.MaCoSo.Value;
            }

            if (!string.IsNullOrEmpty(request.HoTen))
                employee.HoTen = request.HoTen;

            if (request.NgaySinh.HasValue)
                employee.NgaySinh = DateOnly.FromDateTime(request.NgaySinh.Value);

            if (!string.IsNullOrEmpty(request.GioiTinh))
                employee.GioiTinh = request.GioiTinh;

            if (!string.IsNullOrEmpty(request.CmndCccd))
                employee.CmndCccd = request.CmndCccd;

            if (!string.IsNullOrEmpty(request.Sdt))
                employee.Sdt = request.Sdt;

            if (!string.IsNullOrEmpty(request.Email))
                employee.Email = request.Email;

            if (!string.IsNullOrEmpty(request.DiaChi))
                employee.DiaChi = request.DiaChi;

            if (!string.IsNullOrEmpty(request.ChucVu))
                employee.ChucVu = request.ChucVu;

            if (request.LuongCoBan.HasValue)
                employee.LuongCoBan = request.LuongCoBan;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Employee {maNv} updated successfully");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating employee {maNv}: {ex.Message}");
            throw;
        }
    }

    public async Task<bool> DeleteEmployeeAsync(int maNv)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var employee = await _context.NhanViens.FindAsync(maNv);
            if (employee == null)
            {
                throw new InvalidOperationException("Nhân viên không tồn tại");
            }

            // Xóa tài khoản liên quan
            var account = await _context.TaiKhoans.FirstOrDefaultAsync(tk => tk.MaNv == maNv);
            if (account != null)
            {
                _context.TaiKhoans.Remove(account);
            }

            // Xóa nhân viên
            _context.NhanViens.Remove(employee);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            _logger.LogInformation($"Employee {maNv} deleted successfully");
            return true;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError($"Error deleting employee {maNv}: {ex.Message}");
            throw;
        }
    }

    public async Task<bool> ActivateAccountAsync(int maNv)
    {
        try
        {
            var account = await _context.TaiKhoans.FirstOrDefaultAsync(tk => tk.MaNv == maNv);
            if (account == null)
            {
                throw new InvalidOperationException("Tài khoản không tồn tại");
            }

            account.KichHoat = true;
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Account for employee {maNv} activated successfully");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error activating account for employee {maNv}: {ex.Message}");
            throw;
        }
    }

    public async Task<bool> DeactivateAccountAsync(int maNv)
    {
        try
        {
            var account = await _context.TaiKhoans.FirstOrDefaultAsync(tk => tk.MaNv == maNv);
            if (account == null)
            {
                throw new InvalidOperationException("Tài khoản không tồn tại");
            }

            account.KichHoat = false;
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Account for employee {maNv} deactivated successfully");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error deactivating account for employee {maNv}: {ex.Message}");
            throw;
        }
    }
}
