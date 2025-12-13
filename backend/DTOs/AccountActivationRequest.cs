namespace backend.DTOs;

/// <summary>
/// DTO cho request kích hoạt/hủy kích hoạt tài khoản
/// </summary>
public class AccountActivationRequest
{
    public int? MaKh { get; set; }
    public int? MaNv { get; set; }
}
