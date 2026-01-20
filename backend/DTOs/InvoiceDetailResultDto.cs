
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.DTOs;
public class InvoiceDetailResultDto
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

    [Column("tinh_trang_tt")]
    public string? TinhTrangTt { get; set; }

    [Column("ten_khach_hang")]
    public string? TenKhachHang { get; set; }

    [Column("ten_san")]
    public string? TenSan { get; set; }
}
