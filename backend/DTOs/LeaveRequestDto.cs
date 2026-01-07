using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

/// <summary>
/// DTO cho thông tin đơn nghỉ phép
/// </summary>
public class LeaveRequestDto
{
    public int MaDon { get; set; }
    public int MaNv { get; set; }
    public string? TenNhanVien { get; set; }
    public string? ChucVu { get; set; }
    public DateTime NgayNghi { get; set; }
    public string? LyDo { get; set; }
    public string? TrangThai { get; set; } // cho_duyet, da_duyet, tu_choi
}

/// <summary>
/// DTO cho yêu cầu tạo đơn nghỉ phép
/// </summary>
public class CreateLeaveRequest
{
    [Required(ErrorMessage = "Mã nhân viên không được bỏ trống")]
    public int MaNv { get; set; }

    [Required(ErrorMessage = "Ngày nghỉ không được bỏ trống")]
    public DateTime NgayNghi { get; set; }

    [Required(ErrorMessage = "Lý do không được bỏ trống")]
    [StringLength(1000, ErrorMessage = "Lý do không được vượt quá 1000 ký tự")]
    public string LyDo { get; set; } = string.Empty;
}

/// <summary>
/// DTO cho yêu cầu duyệt đơn nghỉ phép
/// </summary>
public class ApproveLeaveRequest
{
    [Required(ErrorMessage = "Trạng thái không được bỏ trống")]
    [RegularExpression("^(da_duyet|tu_choi)$", ErrorMessage = "Trạng thái chỉ có thể là 'da_duyet' hoặc 'tu_choi'")]
    public string TrangThai { get; set; } = string.Empty; // da_duyet hoặc tu_choi
}
