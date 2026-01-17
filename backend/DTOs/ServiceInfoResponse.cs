namespace backend.DTOs;

public class ServiceInfoResponse
{
    public int MaDv { get; set; }
    public string? TenDv { get; set; }
    public string? LoaiDv { get; set; }
    public decimal DonGia { get; set; }
    public string? DonVi { get; set; }
    public string? TrangThai { get; set; }

    // tồn kho (optional)
    public int? MaCoSo { get; set; }
    public int? SoLuongTon { get; set; }
    public DateTime? NgayCapNhat { get; set; }
}
