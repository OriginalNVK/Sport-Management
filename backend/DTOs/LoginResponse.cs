namespace backend.DTOs;

/// <summary>
/// DTO cho response đăng nhập
/// </summary>
public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public int ExpireIn { get; set; } // Thời gian hết hạn tính bằng phút (30 phút)
    public string VaiTro { get; set; } = string.Empty;
    public int? MaKh { get; set; }
    public int? MaNv { get; set; }
}
