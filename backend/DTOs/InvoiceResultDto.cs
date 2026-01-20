using System.ComponentModel.DataAnnotations.Schema;

namespace backend.DTOs;

/// <summary>
/// DTO để nhận kết quả từ stored procedure sp_TaoHoaDon
/// </summary>
public class InvoiceResultDto
{
    [Column("ma_hd")]
    public int MaHd { get; set; }

    [Column("ma_phieu")]
    public int MaPhieu { get; set; }

    [Column("ngay_lap")]
    public DateTime NgayLap { get; set; }

    [Column("tong_tien")]
    public decimal TongTien { get; set; }

    [Column("giam_gia")]
    public decimal GiamGia { get; set; }

    [Column("thue")]
    public decimal Thue { get; set; }

    [Column("tong_cuoi")]
    public decimal TongCuoi { get; set; }

    [Column("ten_khach_hang")]
    public string TenKhachHang { get; set; } = string.Empty;

    [Column("hang_thanh_vien")]
    public string? HangThanhVien { get; set; }
}
