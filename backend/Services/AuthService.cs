using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using backend.DTOs;
using backend.Helpers;
using backend.Models;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services;

/// <summary>
/// Service xử lý các logic liên quan đến authentication
/// </summary>
public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;
    private readonly string _connectionString;

    public AuthService(IConfiguration configuration)
    {
        _configuration = configuration;
        _connectionString = _configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string not found");
    }

    /// <summary>
    /// Xử lý đăng nhập và tạo JWT token
    /// </summary>
    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        using var connection = new SqlConnection(_connectionString);

        // Lấy thông tin tài khoản từ database
        var taiKhoan = await connection.QueryFirstOrDefaultAsync<TaiKhoan>(
            @"SELECT ten_dang_nhap AS TenDangNhap, mat_khau AS MatKhau, vai_tro AS VaiTro, 
                     ma_kh AS MaKh, ma_nv AS MaNv, kich_hoat AS KichHoat
              FROM tai_khoan 
              WHERE ten_dang_nhap = @TenDangNhap",
            new { request.TenDangNhap });

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
            VaiTro = taiKhoan.VaiTro,
            MaKh = taiKhoan.MaKh,
            MaNv = taiKhoan.MaNv
        };
    }

    /// <summary>
    /// Đăng ký tài khoản khách hàng mới
    /// </summary>
    public async Task<string> RegisterCustomerAsync(RegisterRequest request)
    {
        using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            // Kiểm tra tên đăng nhập đã tồn tại chưa
            var existingAccount = await connection.QueryFirstOrDefaultAsync<TaiKhoan>(
                "SELECT * FROM tai_khoan WHERE ten_dang_nhap = @TenDangNhap",
                new { request.TenDangNhap },
                transaction);

            if (existingAccount != null)
                throw new InvalidOperationException("Tên đăng nhập đã tồn tại");

            // Kiểm tra email đã tồn tại chưa
            var existingEmail = await connection.QueryFirstOrDefaultAsync<KhachHang>(
                "SELECT * FROM khach_hang WHERE email = @Email",
                new { request.Email },
                transaction);

            if (existingEmail != null)
                throw new InvalidOperationException("Email đã được sử dụng");

            // Lấy mã khách hàng mới
            var maxMaKh = await connection.QueryFirstOrDefaultAsync<int?>(
                "SELECT MAX(ma_kh) FROM khach_hang",
                transaction: transaction) ?? 0;
            var newMaKh = maxMaKh + 1;

            // Insert khách hàng mới
            await connection.ExecuteAsync(
                @"INSERT INTO khach_hang (ma_kh, ho_ten, ngay_sinh, gioi_tinh, cmnd_cccd, sdt, email, dia_chi, hang_thanh_vien, ngay_tao)
                  VALUES (@MaKh, @HoTen, @NgaySinh, @GioiTinh, @CmndCccd, @Sdt, @Email, @DiaChi, 'thuong', @NgayTao)",
                new
                {
                    MaKh = newMaKh,
                    request.HoTen,
                    request.NgaySinh,
                    request.GioiTinh,
                    request.CmndCccd,
                    request.Sdt,
                    request.Email,
                    request.DiaChi,
                    NgayTao = DateTime.Now
                },
                transaction);

            // Hash password bằng MD5
            var hashedPassword = MD5Helper.HashPassword(request.MatKhau);

            // Insert tài khoản mới (tự động kích hoạt)
            await connection.ExecuteAsync(
                @"INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro, ma_kh, ma_nv, kich_hoat)
                  VALUES (@TenDangNhap, @MatKhau, 'khach_hang', @MaKh, NULL, 1)",
                new
                {
                    request.TenDangNhap,
                    MatKhau = hashedPassword,
                    MaKh = newMaKh
                },
                transaction);

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
        using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            // Kiểm tra tên đăng nhập đã tồn tại chưa
            var existingAccount = await connection.QueryFirstOrDefaultAsync<TaiKhoan>(
                "SELECT * FROM tai_khoan WHERE ten_dang_nhap = @TenDangNhap",
                new { request.TenDangNhap },
                transaction);

            if (existingAccount != null)
                throw new InvalidOperationException("Tên đăng nhập đã tồn tại");

            // Kiểm tra email đã tồn tại chưa
            var existingEmail = await connection.QueryFirstOrDefaultAsync<NhanVien>(
                "SELECT * FROM nhan_vien WHERE email = @Email",
                new { request.Email },
                transaction);

            if (existingEmail != null)
                throw new InvalidOperationException("Email đã được sử dụng");

            // Kiểm tra cơ sở có tồn tại không
            var coSoExists = await connection.QueryFirstOrDefaultAsync<int?>(
                "SELECT ma_co_so FROM co_so WHERE ma_co_so = @MaCoSo",
                new { request.MaCoSo },
                transaction);

            if (coSoExists == null)
                throw new InvalidOperationException("Mã cơ sở không tồn tại");

            // Lấy mã nhân viên mới
            var maxMaNv = await connection.QueryFirstOrDefaultAsync<int?>(
                "SELECT MAX(ma_nv) FROM nhan_vien",
                transaction: transaction) ?? 0;
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

            // Insert nhân viên mới
            await connection.ExecuteAsync(
                @"INSERT INTO nhan_vien (ma_nv, ma_co_so, ho_ten, ngay_sinh, gioi_tinh, cmnd_cccd, sdt, email, dia_chi, chuc_vu, luong_co_ban, ngay_tuyen)
                  VALUES (@MaNv, @MaCoSo, @HoTen, @NgaySinh, @GioiTinh, @CmndCccd, @Sdt, @Email, @DiaChi, @ChucVu, @LuongCoBan, @NgayTuyen)",
                new
                {
                    MaNv = newMaNv,
                    request.MaCoSo,
                    request.HoTen,
                    request.NgaySinh,
                    request.GioiTinh,
                    request.CmndCccd,
                    request.Sdt,
                    request.Email,
                    request.DiaChi,
                    request.ChucVu,
                    request.LuongCoBan,
                    NgayTuyen = DateTime.Now
                },
                transaction);

            // Hash password bằng MD5
            var hashedPassword = MD5Helper.HashPassword(request.MatKhau);

            // Insert tài khoản mới (tự động kích hoạt)
            await connection.ExecuteAsync(
                @"INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro, ma_kh, ma_nv, kich_hoat)
                  VALUES (@TenDangNhap, @MatKhau, @VaiTro, NULL, @MaNv, 1)",
                new
                {
                    request.TenDangNhap,
                    MatKhau = hashedPassword,
                    VaiTro = vaiTro,
                    MaNv = newMaNv
                },
                transaction);

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
            new Claim(ClaimTypes.Role, taiKhoan.VaiTro),
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
