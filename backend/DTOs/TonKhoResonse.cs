namespace backend.DTOs;
// Response dịch vụ thường
public class TonKhoResponse
{
    public int MaTonKho { get; set; }
    public int? MaDv { get; set; }
    public int? MaCoSo { get; set; }
    public int? SoLuongTon { get; set; }
    public DateTime? NgayCapNhat { get; set; }
}