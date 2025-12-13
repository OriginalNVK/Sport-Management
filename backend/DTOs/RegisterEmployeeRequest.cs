using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

/// <summary>
/// DTO cho request đăng ký tài khoản nhân viên
/// </summary>
public class RegisterEmployeeRequest
{
    [Required(ErrorMessage = "Tên đăng nhập là bắt buộc")]
    [StringLength(50, ErrorMessage = "Tên đăng nhập không được quá 50 ký tự")]
    public string TenDangNhap { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
    public string MatKhau { get; set; } = string.Empty;

    [Required(ErrorMessage = "Họ tên là bắt buộc")]
    [StringLength(255, ErrorMessage = "Họ tên không được quá 255 ký tự")]
    public string HoTen { get; set; } = string.Empty;

    public DateTime? NgaySinh { get; set; }

    [StringLength(10, ErrorMessage = "Giới tính không được quá 10 ký tự")]
    public string? GioiTinh { get; set; }

    [StringLength(20, ErrorMessage = "CMND/CCCD không được quá 20 ký tự")]
    public string? CmndCccd { get; set; }

    [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
    [StringLength(20, ErrorMessage = "Số điện thoại không được quá 20 ký tự")]
    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    public string Sdt { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email là bắt buộc")]
    [StringLength(100, ErrorMessage = "Email không được quá 100 ký tự")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    public string Email { get; set; } = string.Empty;

    [StringLength(255, ErrorMessage = "Địa chỉ không được quá 255 ký tự")]
    public string? DiaChi { get; set; }

    [Required(ErrorMessage = "Mã cơ sở là bắt buộc")]
    public int MaCoSo { get; set; }

    [Required(ErrorMessage = "Chức vụ là bắt buộc")]
    [StringLength(50, ErrorMessage = "Chức vụ không được quá 50 ký tự")]
    public string ChucVu { get; set; } = string.Empty; // ql, lt, kt, tn

    [Required(ErrorMessage = "Lương cơ bản là bắt buộc")]
    [Range(0, double.MaxValue, ErrorMessage = "Lương cơ bản phải lớn hơn 0")]
    public decimal LuongCoBan { get; set; }
}
