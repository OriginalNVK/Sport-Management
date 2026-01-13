namespace backend.DTOs;

/// <summary>
/// DTO cho request thêm dịch vụ đi kèm
/// </summary>

/// Dịch vụ thường
public class AddChiTietDvRequest
{
    public int ma_phieu { get; set; }
    public int ma_dv { get; set; }
    public int so_luong { get; set; }
}

// Thêm HLV (huan_luyen_vien -> lich_hlv)
public class AddLichHlvRequest
{
    public int ma_phieu { get; set; }
    public int ma_hlv { get; set; }
    public TimeOnly gio_bat_dau { get; set; }
    public TimeOnly gio_ket_thuc { get; set; }
}