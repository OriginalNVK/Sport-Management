using backend.Data;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace backend.Services;

public class DashboardService : IDashboardService
{
    private readonly SportContext _context;

    public DashboardService(SportContext context)
    {
        _context = context;
    }

    // ============================================================
    // NEW METHODS
    // ============================================================

    public async Task<ReportSummaryResponse> GetSummaryAsync(ReportFilterRequest filter)
    {
        ValidateFilter(filter);

        var fromDate = filter.FromDate;
        var toDate = filter.ToDate;

        // ============================================================
        // 1) DOANH THU
        // Nguồn: thanh_toan(trang_thai='thanh_cong') -> hoa_don -> phieu_dat_san -> san -> co_so/loai_san
        // Lọc theo ngày đặt (pds.ngay_dat). Nếu muốn theo ngày thanh toán thì đổi sang tt.ngay_tt.
        // ============================================================

        // NOTE nullable-safe join:
        // - HoaDon.MaPhieu có thể là int? (scaffold hay để int?) => lọc HasValue trước khi join
        // - PhieuDatSan.MaSan có thể là int? => lọc HasValue trước khi join
        // - PhieuDatSan.NgayDat có thể là DateOnly? => lọc HasValue trước khi compare

        var paidQuery =
            from tt in _context.ThanhToans.AsNoTracking()
            join hd in _context.HoaDons.AsNoTracking() on tt.MaHd equals hd.MaHd
            where (tt.TrangThai ?? "") == "thanh_cong"
            where hd.MaPhieu != null // nếu MaPhieu là int (non-null) thì EF tự bỏ điều kiện
            join pds in _context.PhieuDatSans.AsNoTracking() on hd.MaPhieu equals pds.MaPhieu
            where pds.NgayDat != null
            where pds.NgayDat.Value >= fromDate && pds.NgayDat.Value <= toDate
            where pds.MaSan != null
            join s in _context.Sans.AsNoTracking() on pds.MaSan equals s.MaSan
            where s.MaCoSo != null && s.MaLoai != null
            join cs in _context.CoSos.AsNoTracking() on s.MaCoSo equals cs.MaCoSo
            join ls in _context.LoaiSans.AsNoTracking() on s.MaLoai equals ls.MaLoai
            select new
            {
                CoSo = cs,
                Loai = ls,
                HoaDon = hd
            };

        if (filter.MaCoSo.HasValue)
            paidQuery = paidQuery.Where(x => x.CoSo.MaCoSo == filter.MaCoSo.Value);

        if (filter.MaLoaiSan.HasValue)
            paidQuery = paidQuery.Where(x => x.Loai.MaLoai == filter.MaLoaiSan.Value);

        var doanhThuTheoCoSo = await paidQuery
            .GroupBy(x => new { x.CoSo.MaCoSo, x.CoSo.TenCoSo })
            .Select(g => new RevenueByCoSoDto
            {
                MaCoSo = g.Key.MaCoSo,
                TenCoSo = g.Key.TenCoSo ?? "",
                DoanhThu = g.Sum(x => (decimal?)x.HoaDon.TongCuoi) ?? 0m,
                SoHoaDonThanhCong = g.Select(x => x.HoaDon.MaHd).Distinct().Count()
            })
            .OrderByDescending(x => x.DoanhThu)
            .ToListAsync();

        var doanhThuTheoLoaiSan = await paidQuery
            .GroupBy(x => new { x.Loai.MaLoai, x.Loai.TenLoai })
            .Select(g => new RevenueByLoaiSanDto
            {
                MaLoai = g.Key.MaLoai,
                TenLoai = g.Key.TenLoai ?? "",
                DoanhThu = g.Sum(x => (decimal?)x.HoaDon.TongCuoi) ?? 0m,
                SoHoaDonThanhCong = g.Select(x => x.HoaDon.MaHd).Distinct().Count()
            })
            .OrderByDescending(x => x.DoanhThu)
            .ToListAsync();

        // ============================================================
        // 2) THỐNG KÊ ONLINE / TRỰC TIẾP + HỦY
        // ============================================================

        var pdsQuery =
            from p in _context.PhieuDatSans.AsNoTracking()
            where p.NgayDat != null
            where p.NgayDat.Value >= fromDate && p.NgayDat.Value <= toDate
            where p.MaSan != null
            join s in _context.Sans.AsNoTracking() on p.MaSan equals s.MaSan
            select new { P = p, S = s };

        if (filter.MaCoSo.HasValue)
            pdsQuery = pdsQuery.Where(x => x.S.MaCoSo == filter.MaCoSo.Value);

        if (filter.MaLoaiSan.HasValue)
            pdsQuery = pdsQuery.Where(x => x.S.MaLoai == filter.MaLoaiSan.Value);

        var methodAgg = await pdsQuery
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Online = g.Count(x => (x.P.HinhThuc ?? "") == "online"),
                TrucTiep = g.Count(x => (x.P.HinhThuc ?? "") == "truc_tiep"),
                Tong = g.Count()
            })
            .FirstOrDefaultAsync();

        var bookingMethodStats = new BookingChannelStatsDto
        {
            Online = methodAgg?.Online ?? 0,
            TrucTiep = methodAgg?.TrucTiep ?? 0,
            Tong = methodAgg?.Tong ?? 0
        };

        var cancelCount = await pdsQuery.CountAsync(x => (x.P.TrangThai ?? "") == "huy");

        // ============================================================
        // 3) NO-SHOW / HỦY (lich_su_thay_doi) + tổng tiền phạt
        // ============================================================

        var changeQuery =
            from ch in _context.LichSuThayDois.AsNoTracking()
            join p in _context.PhieuDatSans.AsNoTracking() on ch.MaPhieu equals p.MaPhieu
            where p.NgayDat != null
            where p.NgayDat.Value >= fromDate && p.NgayDat.Value <= toDate
            where p.MaSan != null
            join s in _context.Sans.AsNoTracking() on p.MaSan equals s.MaSan
            select new { Change = ch, San = s };

        if (filter.MaCoSo.HasValue)
            changeQuery = changeQuery.Where(x => x.San.MaCoSo == filter.MaCoSo.Value);

        if (filter.MaLoaiSan.HasValue)
            changeQuery = changeQuery.Where(x => x.San.MaLoai == filter.MaLoaiSan.Value);

        var noShowAgg = await changeQuery
            .Where(x => (x.Change.LoaiThayDoi ?? "") == "no_show")
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Count = g.Count(),
                Penalty = g.Sum(x => (decimal?)x.Change.SoTienPhat) ?? 0m
            })
            .FirstOrDefaultAsync();

        var huyPenaltyAgg = await changeQuery
            .Where(x => (x.Change.LoaiThayDoi ?? "") == "huy")
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Penalty = g.Sum(x => (decimal?)x.Change.SoTienPhat) ?? 0m
            })
            .FirstOrDefaultAsync();

        var cancelNoShowStats = new CancelNoShowStatsDto
        {
            SoLuongHuy = cancelCount,
            SoLuongNoShow = noShowAgg?.Count ?? 0,
            TongTienPhatNoShow = noShowAgg?.Penalty ?? 0m,
            TongTienPhatHuy = huyPenaltyAgg?.Penalty ?? 0m
        };

        // ============================================================
        // 4) TỶ LỆ SỬ DỤNG SÂN (Utilization)
        // Dùng lich_dat_san: tổng phút đặt / (số sân * số ngày * phút hoạt động/ngày)
        // ============================================================

        var opStart = filter.OperatingStart;
        var opEnd = filter.OperatingEnd;
        var opMinutesPerDay = (opEnd.ToTimeSpan() - opStart.ToTimeSpan()).TotalMinutes;
        if (opMinutesPerDay <= 0)
            throw new InvalidOperationException("OperatingEnd phải lớn hơn OperatingStart.");

        int totalDays =
            (toDate.ToDateTime(TimeOnly.MinValue).Date - fromDate.ToDateTime(TimeOnly.MinValue).Date).Days + 1;
        if (totalDays < 0) totalDays = 0;

        // lấy lịch đặt + kèm thông tin sân/cơ sở/loại
        var lichQuery =
            from l in _context.LichDatSans.AsNoTracking()
            where l.Ngay >= fromDate && l.Ngay <= toDate
            join s in _context.Sans.AsNoTracking() on l.MaSan equals s.MaSan
            where s.MaCoSo != null && s.MaLoai != null
            join cs in _context.CoSos.AsNoTracking() on s.MaCoSo equals cs.MaCoSo
            join ls in _context.LoaiSans.AsNoTracking() on s.MaLoai equals ls.MaLoai
            select new { Lich = l, San = s, CoSo = cs, Loai = ls };

        if (filter.MaCoSo.HasValue)
            lichQuery = lichQuery.Where(x => x.CoSo.MaCoSo == filter.MaCoSo.Value);

        if (filter.MaLoaiSan.HasValue)
            lichQuery = lichQuery.Where(x => x.Loai.MaLoai == filter.MaLoaiSan.Value);

        var lichList = await lichQuery.ToListAsync();

        // lấy danh sách sân (để tính số sân theo cơ sở / theo loại)
        var sanFiltered = _context.Sans.AsNoTracking().AsQueryable();
        if (filter.MaCoSo.HasValue) sanFiltered = sanFiltered.Where(x => x.MaCoSo == filter.MaCoSo.Value);
        if (filter.MaLoaiSan.HasValue) sanFiltered = sanFiltered.Where(x => x.MaLoai == filter.MaLoaiSan.Value);

        // fix Dictionary key nullable (int?)
        var sanList = await sanFiltered
            .Where(s => s.MaCoSo != null && s.MaLoai != null)
            .Select(s => new { MaCoSo = s.MaCoSo!.Value, MaLoai = s.MaLoai!.Value })
            .ToListAsync();

        var sanCountByCoSo = sanList
            .GroupBy(x => x.MaCoSo)
            .ToDictionary(g => g.Key, g => g.Count());

        var sanCountByLoai = sanList
            .GroupBy(x => x.MaLoai)
            .ToDictionary(g => g.Key, g => g.Count());

        static double OverlapMinutes(TimeOnly aStart, TimeOnly aEnd, TimeOnly bStart, TimeOnly bEnd)
        {
            var start = (aStart > bStart) ? aStart : bStart;
            var end = (aEnd < bEnd) ? aEnd : bEnd;
            var minutes = (end.ToTimeSpan() - start.ToTimeSpan()).TotalMinutes;
            return minutes > 0 ? minutes : 0;
        }

        var utilByCoSo = lichList
            .GroupBy(x => new { x.CoSo.MaCoSo, x.CoSo.TenCoSo })
            .Select(g =>
            {
                double booked = g.Sum(x => OverlapMinutes(
                    x.Lich.GioBatDau,   // TimeOnly non-null
                    x.Lich.GioKetThuc,  // TimeOnly non-null
                    opStart,
                    opEnd
                ));

                int soSan = sanCountByCoSo.TryGetValue(g.Key.MaCoSo, out var c) ? c : 0;
                double capacity = soSan * totalDays * opMinutesPerDay;
                double rate = capacity > 0 ? booked / capacity : 0;

                return new UtilizationByCoSoDto
                {
                    MaCoSo = g.Key.MaCoSo,
                    TenCoSo = g.Key.TenCoSo ?? "",
                    SoSan = soSan,
                    TongPhutDat = booked,
                    TongPhutKhaDung = capacity,
                    TyLeSuDung = rate
                };
            })
            .OrderByDescending(x => x.TyLeSuDung)
            .ToList();

        var utilByLoai = lichList
            .GroupBy(x => new { x.Loai.MaLoai, x.Loai.TenLoai })
            .Select(g =>
            {
                double booked = g.Sum(x => OverlapMinutes(
                    x.Lich.GioBatDau,
                    x.Lich.GioKetThuc,
                    opStart,
                    opEnd
                ));

                int soSan = sanCountByLoai.TryGetValue(g.Key.MaLoai, out var c) ? c : 0;
                double capacity = soSan * totalDays * opMinutesPerDay;
                double rate = capacity > 0 ? booked / capacity : 0;

                return new UtilizationByLoaiSanDto
                {
                    MaLoai = g.Key.MaLoai,
                    TenLoai = g.Key.TenLoai ?? "",
                    SoSan = soSan,
                    TongPhutDat = booked,
                    TongPhutKhaDung = capacity,
                    TyLeSuDung = rate
                };
            })
            .OrderByDescending(x => x.TyLeSuDung)
            .ToList();

        return new ReportSummaryResponse
        {
            Filter = filter,
            DoanhThuTheoCoSo = doanhThuTheoCoSo,
            DoanhThuTheoLoaiSan = doanhThuTheoLoaiSan,
            TyLeSuDungTheoCoSo = utilByCoSo,
            TyLeSuDungTheoLoaiSan = utilByLoai,
            DatOnlineTrucTiep = bookingMethodStats,
            HuyNoShow = cancelNoShowStats
        };
    }

    public async Task<byte[]> ExportCsvAsync(ReportFilterRequest filter)
    {
        var summary = await GetSummaryAsync(filter);

        var sb = new StringBuilder();
        sb.AppendLine("REPORT_SUMMARY");
        sb.AppendLine($"FromDate,{summary.Filter.FromDate:yyyy-MM-dd}");
        sb.AppendLine($"ToDate,{summary.Filter.ToDate:yyyy-MM-dd}");
        sb.AppendLine($"MaCoSo,{summary.Filter.MaCoSo?.ToString() ?? ""}");
        sb.AppendLine($"MaLoaiSan,{summary.Filter.MaLoaiSan?.ToString() ?? ""}");
        sb.AppendLine($"OperatingStart,{summary.Filter.OperatingStart}");
        sb.AppendLine($"OperatingEnd,{summary.Filter.OperatingEnd}");
        sb.AppendLine();

        sb.AppendLine("DOANH_THU_THEO_CO_SO");
        sb.AppendLine("MaCoSo,TenCoSo,DoanhThu,SoHoaDonThanhCong");
        foreach (var x in summary.DoanhThuTheoCoSo)
            sb.AppendLine($"{x.MaCoSo},\"{Escape(x.TenCoSo)}\",{x.DoanhThu},{x.SoHoaDonThanhCong}");
        sb.AppendLine();

        sb.AppendLine("DOANH_THU_THEO_LOAI_SAN");
        sb.AppendLine("MaLoai,TenLoai,DoanhThu,SoHoaDonThanhCong");
        foreach (var x in summary.DoanhThuTheoLoaiSan)
            sb.AppendLine($"{x.MaLoai},\"{Escape(x.TenLoai)}\",{x.DoanhThu},{x.SoHoaDonThanhCong}");
        sb.AppendLine();

        sb.AppendLine("TY_LE_SU_DUNG_THEO_CO_SO");
        sb.AppendLine("MaCoSo,TenCoSo,SoSan,TongPhutDat,TongPhutKhaDung,TyLeSuDung(%)");
        foreach (var x in summary.TyLeSuDungTheoCoSo)
            sb.AppendLine($"{x.MaCoSo},\"{Escape(x.TenCoSo)}\",{x.SoSan},{x.TongPhutDat},{x.TongPhutKhaDung},{(x.TyLeSuDung * 100.0):0.00}");
        sb.AppendLine();

        sb.AppendLine("TY_LE_SU_DUNG_THEO_LOAI_SAN");
        sb.AppendLine("MaLoai,TenLoai,SoSan,TongPhutDat,TongPhutKhaDung,TyLeSuDung(%)");
        foreach (var x in summary.TyLeSuDungTheoLoaiSan)
            sb.AppendLine($"{x.MaLoai},\"{Escape(x.TenLoai)}\",{x.SoSan},{x.TongPhutDat},{x.TongPhutKhaDung},{(x.TyLeSuDung * 100.0):0.00}");
        sb.AppendLine();

        sb.AppendLine("DAT_ONLINE_TRUC_TIEP");
        sb.AppendLine("Online,TrucTiep,Tong");
        sb.AppendLine($"{summary.DatOnlineTrucTiep.Online},{summary.DatOnlineTrucTiep.TrucTiep},{summary.DatOnlineTrucTiep.Tong}");
        sb.AppendLine();

        sb.AppendLine("HUY_NO_SHOW");
        sb.AppendLine("SoLuongHuy,SoLuongNoShow,TongTienPhatHuy,TongTienPhatNoShow");
        sb.AppendLine($"{summary.HuyNoShow.SoLuongHuy},{summary.HuyNoShow.SoLuongNoShow},{summary.HuyNoShow.TongTienPhatHuy},{summary.HuyNoShow.TongTienPhatNoShow}");

        return Encoding.UTF8.GetBytes(sb.ToString());

        static string Escape(string s) => (s ?? "").Replace("\"", "\"\"");
    }

    // ============================================================
    // OLD METHODS (WRAP để không vỡ code cũ trong project)
    // ============================================================

    public async Task<List<RevenueByCoSoDto>> GetRevenueByFacility(DateTime? from, DateTime? to)
    {
        var filter = ToFilter(from, to);
        var summary = await GetSummaryAsync(filter);
        return summary.DoanhThuTheoCoSo;
    }

    public async Task<List<RevenueByLoaiSanDto>> GetRevenueByFieldType(DateTime? from, DateTime? to)
    {
        var filter = ToFilter(from, to);
        var summary = await GetSummaryAsync(filter);
        return summary.DoanhThuTheoLoaiSan;
    }

    public async Task<BookingChannelStatsDto> GetBookingMethodStats(DateTime? from, DateTime? to)
    {
        var filter = ToFilter(from, to);
        var summary = await GetSummaryAsync(filter);
        return summary.DatOnlineTrucTiep;
    }

    public async Task<List<UtilizationByCoSoDto>> GetFieldUsage(DateTime? from, DateTime? to)
    {
        var filter = ToFilter(from, to);
        var summary = await GetSummaryAsync(filter);
        return summary.TyLeSuDungTheoCoSo;
    }

    public async Task<CancelNoShowStatsDto> GetCancelNoShowStats(DateTime? from, DateTime? to)
    {
        var filter = ToFilter(from, to);
        var summary = await GetSummaryAsync(filter);
        return summary.HuyNoShow;
    }

    // ============================================================
    // HELPERS
    // ============================================================

    private static ReportFilterRequest ToFilter(DateTime? from, DateTime? to)
    {
        var fromDt = (from ?? DateTime.Today.AddDays(-30)).Date;
        var toDt = (to ?? DateTime.Today).Date;

        return new ReportFilterRequest
        {
            FromDate = DateOnly.FromDateTime(fromDt),
            ToDate = DateOnly.FromDateTime(toDt)
        };
    }

    private static void ValidateFilter(ReportFilterRequest filter)
    {
        if (filter.ToDate < filter.FromDate)
            throw new InvalidOperationException("ToDate phải >= FromDate.");
    }
}
