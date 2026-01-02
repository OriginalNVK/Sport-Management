using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.DTOs;
using backend.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services;

public class AuthService : IAuthService
{
    private readonly SportContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(SportContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }
    
    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        // Lấy thông tin tài khoản từ database
        var taiKhoan = await _context.TaiKhoans
            .FirstOrDefaultAsync(t => t.TenDangNhap == request.TenDangNhap);

        if (taiKhoan == null)
            return null;

        // Kiểm tra password với MD5 hash
        if (!MD5Helper.VerifyPassword(request.MatKhau, taiKhoan.MatKhau))
            return null;

        // Tạo JWT token
        var token = GenerateJwtToken(taiKhoan);
        var refreshToken = GenerateRefreshToken();

        return new LoginResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            ExpireIn = 30, // 30 phút
            VaiTro = taiKhoan.VaiTro ?? string.Empty,
            MaKh = taiKhoan.MaKh,
            MaNv = taiKhoan.MaNv
        };
    }

    /// <summary>
    /// Đăng ký tài khoản khách hàng mới
    /// </summary>
    public async Task<string> RegisterCustomerAsync(RegisterRequest request)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Kiểm tra tên đăng nhập đã tồn tại chưa
            var existingAccount = await _context.TaiKhoans
                .FirstOrDefaultAsync(t => t.TenDangNhap == request.TenDangNhap);

            if (existingAccount != null)
                throw new InvalidOperationException("Tên đăng nhập đã tồn tại");

            // Kiểm tra email đã tồn tại chưa
            var existingEmail = await _context.KhachHangs
                .FirstOrDefaultAsync(k => k.Email == request.Email);

            if (existingEmail != null)
                throw new InvalidOperationException("Email đã được sử dụng");

            // Lấy mã khách hàng mới
            var maxMaKh = await _context.KhachHangs.MaxAsync(k => (int?)k.MaKh) ?? 0;
            var newMaKh = maxMaKh + 1;

            // Tạo khách hàng mới
            var khachHang = new KhachHang
            {
                MaKh = newMaKh,
                HoTen = request.HoTen,
                NgaySinh = request.NgaySinh.HasValue ? DateOnly.FromDateTime(request.NgaySinh.Value) : null,
                GioiTinh = request.GioiTinh,
                CmndCccd = request.CmndCccd,
                Sdt = request.Sdt,
                Email = request.Email,
                DiaChi = request.DiaChi,
                HangThanhVien = "thuong",
                NgayTao = DateTime.Now
            };

            _context.KhachHangs.Add(khachHang);
            await _context.SaveChangesAsync();

            // Hash password bằng MD5
            var hashedPassword = MD5Helper.HashPassword(request.MatKhau);

            // Tạo tài khoản mới (tự động kích hoạt)
            var taiKhoan = new TaiKhoan
            {
                TenDangNhap = request.TenDangNhap,
                MatKhau = hashedPassword,
                VaiTro = "khach_hang",
                MaKh = newMaKh,
                MaNv = null,
                KichHoat = true
            };

            _context.TaiKhoans.Add(taiKhoan);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();
            return "Tài khoản đăng ký thành công";
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    /// <summary>
    /// Đăng ký tài khoản nhân viên mới
    /// </summary>
    public async Task<string> RegisterEmployeeAsync(RegisterEmployeeRequest request)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Kiểm tra tên đăng nhập đã tồn tại chưa
            var existingAccount = await _context.TaiKhoans
                .FirstOrDefaultAsync(t => t.TenDangNhap == request.TenDangNhap);

            if (existingAccount != null)
                throw new InvalidOperationException("Tên đăng nhập đã tồn tại");

            // Kiểm tra email đã tồn tại chưa
            var existingEmail = await _context.NhanViens
                .FirstOrDefaultAsync(n => n.Email == request.Email);

            if (existingEmail != null)
                throw new InvalidOperationException("Email đã được sử dụng");

            // Kiểm tra cơ sở có tồn tại không
            var coSoExists = await _context.CoSos
                .AnyAsync(c => c.MaCoSo == request.MaCoSo);

            if (!coSoExists)
                throw new InvalidOperationException("Mã cơ sở không tồn tại");

            // Lấy mã nhân viên mới
            var maxMaNv = await _context.NhanViens.MaxAsync(n => (int?)n.MaNv) ?? 0;
            var newMaNv = maxMaNv + 1;

            // Xác định vai trò dựa trên chức vụ
            string vaiTro = request.ChucVu.ToLower() switch
            {
                "ql" => "quan_ly",
                "lt" => "le_tan",
                "kt" => "ky_thuat",
                "tn" => "thu_ngan",
                _ => "nhanvien_bt"
            };

            // Tạo nhân viên mới
            var nhanVien = new NhanVien
            {
                MaNv = newMaNv,
                MaCoSo = request.MaCoSo,
                HoTen = request.HoTen,
                NgaySinh = request.NgaySinh.HasValue ? DateOnly.FromDateTime(request.NgaySinh.Value) : null,
                GioiTinh = request.GioiTinh,
                CmndCccd = request.CmndCccd,
                Sdt = request.Sdt,
                Email = request.Email,
                DiaChi = request.DiaChi,
                ChucVu = request.ChucVu,
                LuongCoBan = request.LuongCoBan,
                NgayTuyen = DateTime.Now
            };

            _context.NhanViens.Add(nhanVien);
            await _context.SaveChangesAsync();

            // Hash password bằng MD5
            var hashedPassword = MD5Helper.HashPassword(request.MatKhau);

            // Tạo tài khoản mới (tự động kích hoạt)
            var taiKhoan = new TaiKhoan
            {
                TenDangNhap = request.TenDangNhap,
                MatKhau = hashedPassword,
                VaiTro = vaiTro,
                MaKh = null,
                MaNv = newMaNv,
                KichHoat = true
            };

            _context.TaiKhoans.Add(taiKhoan);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();
            return "Tài khoản nhân viên đăng ký thành công";
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    /// <summary>
    /// Tạo JWT token từ thông tin tài khoản
    /// </summary>
    private string GenerateJwtToken(TaiKhoan taiKhoan)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT Secret Key not found");
        var issuer = jwtSettings["Issuer"] ?? "SportManagement";
        var audience = jwtSettings["Audience"] ?? "SportManagementUsers";

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, taiKhoan.TenDangNhap),
            new Claim(ClaimTypes.Role, taiKhoan.VaiTro ?? "user"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        if (taiKhoan.MaKh.HasValue)
            claims.Add(new Claim("ma_kh", taiKhoan.MaKh.Value.ToString()));

        if (taiKhoan.MaNv.HasValue)
            claims.Add(new Claim("ma_nv", taiKhoan.MaNv.Value.ToString()));

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(30), // Token hết hạn sau 30 phút
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Tạo refresh token ngẫu nhiên
    /// </summary>
    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}
