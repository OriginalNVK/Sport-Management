using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

/// <summary>
/// DTO cho thông tin ca trực
/// </summary>
public class ShiftDto
{
    public int MaCa { get; set; }
    public int MaCoSo { get; set; }
    public string? TenCoSo { get; set; }
    public DateTime Ngay { get; set; }
    public TimeSpan GioBatDau { get; set; }
    public TimeSpan GioKetThuc { get; set; }
    public string? TenCa { get; set; }
}

/// <summary>
/// DTO cho yêu cầu tạo mới ca trực
/// </summary>
public class CreateShiftRequest
{
    [Required(ErrorMessage = "Mã cơ sở không được bỏ trống")]
    public int MaCoSo { get; set; }

    [Required(ErrorMessage = "Ngày không được bỏ trống")]
    public DateTime Ngay { get; set; }

    [Required(ErrorMessage = "Giờ bắt đầu không được bỏ trống")]
    public TimeSpan GioBatDau { get; set; }

    [Required(ErrorMessage = "Giờ kết thúc không được bỏ trống")]
    public TimeSpan GioKetThuc { get; set; }

    [Required(ErrorMessage = "Tên ca không được bỏ trống")]
    [StringLength(255, ErrorMessage = "Tên ca không được vượt quá 255 ký tự")]
    public string TenCa { get; set; } = string.Empty;
}

/// <summary>
/// DTO cho thông tin phân công ca
/// </summary>
public class ShiftAssignmentDto
{
    public int MaPc { get; set; }
    public int MaNv { get; set; }
    public string? TenNhanVien { get; set; }
    public string? ChucVu { get; set; }
    public int MaCa { get; set; }
    public string? TenCa { get; set; }
    public DateTime? Ngay { get; set; }
    public TimeSpan? GioBatDau { get; set; }
    public TimeSpan? GioKetThuc { get; set; }
}

/// <summary>
/// DTO cho yêu cầu phân công ca trực
/// </summary>
public class AssignShiftRequest
{
    [Required(ErrorMessage = "Mã nhân viên không được bỏ trống")]
    public int MaNv { get; set; }

    [Required(ErrorMessage = "Mã ca không được bỏ trống")]
    public int MaCa { get; set; }
}

/// <summary>
/// DTO cho yêu cầu cập nhật ca trực
/// </summary>
public class UpdateShiftRequest
{
    public DateTime? Ngay { get; set; }
    
    public TimeSpan? GioBatDau { get; set; }
    
    public TimeSpan? GioKetThuc { get; set; }
    
    [StringLength(255, ErrorMessage = "Tên ca không được vượt quá 255 ký tự")]
    public string? TenCa { get; set; }
}
