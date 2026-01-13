namespace backend.DTOs;
// Response dịch vụ thường
public class ChiTietDvResponse
{
    public int ma_ct { get; set; }
    public int ma_phieu { get; set; }
    public int ma_dv { get; set; }
    public string? ten_dv { get; set; }
    public int so_luong { get; set; }
    public decimal don_gia { get; set; }
    public decimal thanh_tien { get; set; }
}

// Response lịch HLV
public class LichHlvResponse
{
    public int ma_lich { get; set; }
    public int ma_phieu { get; set; }
    public int ma_hlv { get; set; }
    public string? ho_ten { get; set; }
    public TimeOnly gio_bat_dau { get; set; }
    public TimeOnly gio_ket_thuc { get; set; }
    public decimal don_gia { get; set; }
    public decimal thanh_tien { get; set; }
}