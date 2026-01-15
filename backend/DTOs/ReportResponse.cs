namespace backend.DTOs;

// Revenue
public class RevenueByCoSoDto
{
    public int MaCoSo { get; set; }
    public string TenCoSo { get; set; } = "";
    public decimal DoanhThu { get; set; }
    public int SoHoaDonThanhCong { get; set; }
}

public class RevenueByLoaiSanDto
{
    public int MaLoai { get; set; }
    public string TenLoai { get; set; } = "";
    public decimal DoanhThu { get; set; }
    public int SoHoaDonThanhCong { get; set; }
}

// Utilization
public class UtilizationByCoSoDto
{
    public int MaCoSo { get; set; }
    public string TenCoSo { get; set; } = "";
    public int SoSan { get; set; }
    public double TongPhutDat { get; set; }
    public double TongPhutKhaDung { get; set; }
    public double TyLeSuDung { get; set; } // 0..1
}

public class UtilizationByLoaiSanDto
{
    public int MaLoai { get; set; }
    public string TenLoai { get; set; } = "";
    public int SoSan { get; set; }
    public double TongPhutDat { get; set; }
    public double TongPhutKhaDung { get; set; }
    public double TyLeSuDung { get; set; } // 0..1
}

// Booking channels
public class BookingChannelStatsDto
{
    public int Online { get; set; }
    public int TrucTiep { get; set; }
    public int Tong { get; set; }
}

// Cancel / No-show
public class CancelNoShowStatsDto
{
    public int SoLuongHuy { get; set; }
    public int SoLuongNoShow { get; set; }
    public decimal TongTienPhatHuy { get; set; }
    public decimal TongTienPhatNoShow { get; set; }
}

// Full response
public class ReportSummaryResponse
{
    public ReportFilterRequest Filter { get; set; } = new();

    public List<RevenueByCoSoDto> DoanhThuTheoCoSo { get; set; } = new();
    public List<RevenueByLoaiSanDto> DoanhThuTheoLoaiSan { get; set; } = new();

    public List<UtilizationByCoSoDto> TyLeSuDungTheoCoSo { get; set; } = new();
    public List<UtilizationByLoaiSanDto> TyLeSuDungTheoLoaiSan { get; set; } = new();

    public BookingChannelStatsDto DatOnlineTrucTiep { get; set; } = new();
    public CancelNoShowStatsDto HuyNoShow { get; set; } = new();
}
