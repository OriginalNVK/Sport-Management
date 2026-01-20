namespace backend.DTOs;
using System.ComponentModel.DataAnnotations.Schema;

public class UpdateInvoiceResultDto
{
    [Column("ma_hd")]
    public int MaHd { get; set; }

    [Column("ma_phieu")]
    public int MaPhieu { get; set; }

    [Column("tong_tien")]
    public decimal TongTien { get; set; }

    [Column("giam_gia")]
    public decimal GiamGia { get; set; }

    [Column("thue")]
    public decimal Thue { get; set; }

    [Column("tong_cuoi")]
    public decimal TongCuoi { get; set; }
}