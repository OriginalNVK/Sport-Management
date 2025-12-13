using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

/// <summary>
/// DTO cho request đăng nhập
/// </summary>
public class LoginRequest
{
    [Required(ErrorMessage = "Tên đăng nhập là bắt buộc")]
    public string TenDangNhap { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
    public string MatKhau { get; set; } = string.Empty;
}
