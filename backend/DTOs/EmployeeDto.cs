using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

/// <summary>
/// DTO cho thông tin nhân viên
/// </summary>
public class EmployeeDto
{
    public int MaNv { get; set; }
    public int MaCoSo { get; set; }
    public string? TenCoSo { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public DateTime? NgaySinh { get; set; }
    public string? GioiTinh { get; set; }
    public string? CmndCccd { get; set; }
    public string? Sdt { get; set; }
    public string? Email { get; set; }
    public string? DiaChi { get; set; }
    public string? ChucVu { get; set; } // ql, lt, kt, tn
    public decimal? LuongCoBan { get; set; }
    public DateTime? NgayTuyen { get; set; }
    public string? TenDangNhap { get; set; }
    public string? VaiTro { get; set; }
    public bool? KichHoat { get; set; }
}

/// <summary>
/// DTO cho yêu cầu tạo mới nhân viên
/// </summary>
public class CreateEmployeeRequest
{
    [Required(ErrorMessage = "Mã cơ sở không được bỏ trống")]
    public int MaCoSo { get; set; }

    [Required(ErrorMessage = "Họ tên không được bỏ trống")]
    [StringLength(255, ErrorMessage = "Họ tên không được vượt quá 255 ký tự")]
    public string HoTen { get; set; } = string.Empty;

    public DateTime? NgaySinh { get; set; }

    [StringLength(10, ErrorMessage = "Giới tính không được vượt quá 10 ký tự")]
    public string? GioiTinh { get; set; }

    [StringLength(20, ErrorMessage = "CMND/CCCD không được vượt quá 20 ký tự")]
    public string? CmndCccd { get; set; }

    [StringLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự")]
    public string? Sdt { get; set; }

    [StringLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    public string? Email { get; set; }

    [StringLength(255, ErrorMessage = "Địa chỉ không được vượt quá 255 ký tự")]
    public string? DiaChi { get; set; }

    [Required(ErrorMessage = "Chức vụ không được bỏ trống")]
    [StringLength(50, ErrorMessage = "Chức vụ không được vượt quá 50 ký tự")]
    public string ChucVu { get; set; } = string.Empty; // ql, lt, kt, tn

    public decimal? LuongCoBan { get; set; }

    [Required(ErrorMessage = "Tên đăng nhập không được bỏ trống")]
    [StringLength(50, ErrorMessage = "Tên đăng nhập không được vượt quá 50 ký tự")]
    public string TenDangNhap { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mật khẩu không được bỏ trống")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu phải từ 6-100 ký tự")]
    public string MatKhau { get; set; } = string.Empty;

    [StringLength(50, ErrorMessage = "Vai trò không được vượt quá 50 ký tự")]
    public string? VaiTro { get; set; } // le_tan, thu_ngan, ky_thuat, quan_ly
}

/// <summary>
/// DTO cho yêu cầu cập nhật thông tin nhân viên
/// </summary>
public class UpdateEmployeeRequest
{
    public int? MaCoSo { get; set; }

    [StringLength(255, ErrorMessage = "Họ tên không được vượt quá 255 ký tự")]
    public string? HoTen { get; set; }

    public DateTime? NgaySinh { get; set; }

    [StringLength(10, ErrorMessage = "Giới tính không được vượt quá 10 ký tự")]
    public string? GioiTinh { get; set; }

    [StringLength(20, ErrorMessage = "CMND/CCCD không được vượt quá 20 ký tự")]
    public string? CmndCccd { get; set; }

    [StringLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự")]
    public string? Sdt { get; set; }

    [StringLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    public string? Email { get; set; }

    [StringLength(255, ErrorMessage = "Địa chỉ không được vượt quá 255 ký tự")]
    public string? DiaChi { get; set; }

    [StringLength(50, ErrorMessage = "Chức vụ không được vượt quá 50 ký tự")]
    public string? ChucVu { get; set; }

    public decimal? LuongCoBan { get; set; }
}
