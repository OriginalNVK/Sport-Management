namespace backend.DTOs;

public class ReceptionistCreatedRequest
{
    public int MaNv { get; set; }
}

public class ReceptionistCreatedResponse
{
    public int MaNv { get; set; }
    public string TenDangNhap { get; set; } = string.Empty;
}
