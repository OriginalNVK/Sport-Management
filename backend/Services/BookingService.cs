using backend.Data;
using backend.DTOs;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class BookingService : IBookingService
{
    private readonly SportContext _context;

    public BookingService(SportContext context)
    {
        _context = context;
    }

    public async Task<AvailabilityResponse> CheckAvailabilityAsync(CheckFieldAvailabilityRequest request)
    {
        ValidateTimeRange(request.GioBatDau, request.GioKetThuc);

        // 1) Check sân tồn tại
        var san = await _context.Sans
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.MaSan == request.MaSan);

        if (san == null)
        {
            return new AvailabilityResponse
            {
                IsAvailable = false,
                Message = $"Không tìm thấy sân với mã {request.MaSan}"
            };
        }

        // 2) Check tình trạng sân
        if (!string.Equals((san.TinhTrang ?? "").Trim(), "con_trong", StringComparison.OrdinalIgnoreCase))
        {
            return new AvailabilityResponse
            {
                IsAvailable = false,
                Message = $"Sân {request.MaSan} hiện không khả dụng (tình trạng: {san.TinhTrang})"
            };
        }

        // 3) Check lịch bận
        var busy = await _context.LichDatSans
            .AsNoTracking()
            .Where(x => x.MaSan == request.MaSan && x.Ngay == request.NgayDat)
            .Where(x => request.GioBatDau < x.GioKetThuc && request.GioKetThuc > x.GioBatDau)
            .OrderBy(x => x.GioBatDau)
            .Select(x => new BusySlot
            {
                MaLich = x.MaLich,
                MaPhieu = x.MaPhieu,
                Ngay = x.Ngay,
                GioBatDau = x.GioBatDau,
                GioKetThuc = x.GioKetThuc
            })
            .ToListAsync();

        return new AvailabilityResponse
        {
            IsAvailable = busy.Count == 0,
            Message = busy.Count == 0 ? "Sân trống trong khung giờ yêu cầu" : "Sân đã có lịch trong khung giờ yêu cầu",
            BusySlots = busy
        };
    }

    public async Task<int> CreateBookingAsync(CreateBookingRequest request, string? nguoiTaoPhieu)
    {
        ValidateTimeRange(request.GioBatDau, request.GioKetThuc);

        await using var tx = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

        // Check sân
        var san = await _context.Sans.FirstOrDefaultAsync(s => s.MaSan == request.MaSan);
        if (san == null)
            throw new InvalidOperationException($"Không tìm thấy sân với mã {request.MaSan}");

        if (!string.Equals((san.TinhTrang ?? "").Trim(), "con_trong", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException($"Sân {request.MaSan} hiện không khả dụng (tình trạng: {san.TinhTrang})");

        // Check trùng lịch
        var conflict = await _context.LichDatSans.AnyAsync(x =>
            x.MaSan == request.MaSan &&
            x.Ngay == request.NgayDat &&
            request.GioBatDau < x.GioKetThuc &&
            request.GioKetThuc > x.GioBatDau
        );

        if (conflict)
            throw new InvalidOperationException("Sân đã được đặt trong khung giờ này. Vui lòng chọn giờ khác.");

        // Sinh mã phiếu
        var maxMaPhieu = await _context.PhieuDatSans.MaxAsync(x => (int?)x.MaPhieu) ?? 0;
        var nextMaPhieu = maxMaPhieu + 1;

        // Tạo phiếu
        var phieu = new PhieuDatSan
        {
            MaPhieu = nextMaPhieu,
            MaKh = request.MaKh,
            MaSan = request.MaSan,
            NguoiTaoPhieu = string.IsNullOrWhiteSpace(nguoiTaoPhieu) ? null : nguoiTaoPhieu,
            NgayTaoPhieu = DateTime.Now,

            NgayDat = request.NgayDat,
            GioBatDau = request.GioBatDau,
            GioKetThuc = request.GioKetThuc,

            HinhThuc = request.HinhThuc,
            TrangThai = "cho_xac_nhan",
            TongTien = request.TongTien ?? 0m,
            TinhTrangTt = "chua_tt"
        };

        _context.PhieuDatSans.Add(phieu);

        // Ghi lịch đặt sân
        var lich = new LichDatSan
        {
            MaSan = request.MaSan,
            MaPhieu = nextMaPhieu,
            Ngay = request.NgayDat,
            GioBatDau = request.GioBatDau,
            GioKetThuc = request.GioKetThuc
        };

        _context.LichDatSans.Add(lich);

        await _context.SaveChangesAsync();
        await tx.CommitAsync();

        return nextMaPhieu;
    }

    public async Task<List<BookingResponse>> GetBookingsByCustomerAsync(int maKh)
    {
        var list = await _context.PhieuDatSans
            .AsNoTracking()
            .Where(x => x.MaKh == maKh)
            .OrderByDescending(x => x.NgayTaoPhieu)
            .ToListAsync();

        return list.Select(x => new BookingResponse
        {
            MaPhieu = x.MaPhieu,
            MaKh = x.MaKh ?? 0,
            MaSan = x.MaSan ?? 0,
            NguoiTaoPhieu = x.NguoiTaoPhieu,
            NgayTaoPhieu = x.NgayTaoPhieu ?? DateTime.MinValue,
            NgayDat = x.NgayDat ?? DateOnly.MinValue,
            GioBatDau = x.GioBatDau ?? TimeOnly.MinValue,
            GioKetThuc = x.GioKetThuc ?? TimeOnly.MinValue,
            HinhThuc = x.HinhThuc ?? "",
            TrangThai = x.TrangThai ?? "",
            TongTien = x.TongTien ?? 0m,
            TinhTrangTt = x.TinhTrangTt ?? ""
        }).ToList();
    }

    public async Task<bool> CancelBookingAsync(int maPhieu, string? nguoiHuy)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();

        var phieu = await _context.PhieuDatSans.FirstOrDefaultAsync(x => x.MaPhieu == maPhieu);
        if (phieu == null) return false;

        if (string.Equals((phieu.TinhTrangTt ?? "").Trim(), "da_tt", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Phiếu đã thanh toán, không thể hủy theo quy tắc hiện tại.");

        if (string.Equals((phieu.TrangThai ?? "").Trim(), "huy", StringComparison.OrdinalIgnoreCase))
            return true;

        phieu.TrangThai = "huy";

        var lich = await _context.LichDatSans.Where(x => x.MaPhieu == maPhieu).ToListAsync();
        _context.LichDatSans.RemoveRange(lich);

        await _context.SaveChangesAsync();
        await tx.CommitAsync();

        return true;
    }

    public async Task<List<UserBookingDto>> GetMyBookingsAsync(int? maKh, int? maNv)
    {
        // Sử dụng stored procedure sp_GetMyBookings
        var maKhParam = new SqlParameter("@MaKh", maKh.HasValue ? (object)maKh.Value : DBNull.Value);
        var maNvParam = new SqlParameter("@MaNv", maNv.HasValue ? (object)maNv.Value : DBNull.Value);

        var bookings = await _context.Database
            .SqlQueryRaw<BookingResultFromSP>(
                "EXEC sp_GetMyBookingsUnPaid @MaKh, @MaNv",
                maKhParam,
                maNvParam
            )
            .ToListAsync();

        var result = bookings.Select(b =>
        {
            var loaiSan = b.MaLoai switch
            {
                1 => "Badminton",
                2 => "Basketball",
                3 => "Tennis",
                4 => "Football",
                _ => "Unknown"
            };

            var displayText = b.MaHoaDon.HasValue
                ? $"Booking #{b.MaHoaDon} - {loaiSan} sân {b.TenSan}"
                : $"Booking #{b.MaPhieu} - {loaiSan} sân {b.TenSan}";

            return new UserBookingDto
            {
                MaPhieu = b.MaPhieu,
                MaHoaDon = b.MaHoaDon,
                DisplayText = displayText,
                NgayDat = b.NgayDat,
                GioBatDau = b.GioBatDau,
                GioKetThuc = b.GioKetThuc,
                TrangThai = b.TrangThai,
                TongTien = b.TongTien,
                TinhTrangTt = b.TinhTrangTt,
                DanhSachDichVu = b.DanhSachDichVu
            };
        }).ToList();

        return result;
    }

    public async Task<List<UserBookingDto>> GetAllBookingsAsync(string? tinhTrangTt = null)
    {
        // Sử dụng stored procedure sp_GetAllBookings
        var tinhTrangParam = new SqlParameter("@TinhTrangTt",
            string.IsNullOrEmpty(tinhTrangTt) ? (object)DBNull.Value : tinhTrangTt);

        var bookings = await _context.Database
            .SqlQueryRaw<BookingResultFromSP>(
                "EXEC sp_GetAllBookings @TinhTrangTt",
                tinhTrangParam
            )
            .ToListAsync();

        var result = bookings.Select(b =>
        {
            var loaiSan = b.TenLoai ?? (b.MaLoai switch
            {
                1 => "Badminton",
                2 => "Basketball",
                3 => "Tennis",
                4 => "Football",
                _ => "Unknown"
            });

            var displayText = b.MaHoaDon.HasValue
                ? $"Booking #{b.MaHoaDon} - {loaiSan} sân {b.TenSan}"
                : $"Booking #{b.MaPhieu} - {loaiSan} sân {b.TenSan}";

            return new UserBookingDto
            {
                MaPhieu = b.MaPhieu,
                MaHoaDon = b.MaHoaDon,
                DisplayText = displayText,
                NgayDat = b.NgayDat,
                GioBatDau = b.GioBatDau,
                GioKetThuc = b.GioKetThuc,
                TrangThai = b.TrangThai,
                TongTien = b.TongTien,
                TinhTrangTt = b.TinhTrangTt,
                DanhSachDichVu = b.DanhSachDichVu
            };
        }).ToList();

        return result;
    }

    private static void ValidateTimeRange(TimeOnly start, TimeOnly end)
    {
        if (end <= start)
            throw new InvalidOperationException("Giờ kết thúc phải lớn hơn giờ bắt đầu.");
    }
}

// DTO để nhận kết quả từ stored procedure
internal class BookingResultFromSP
{
    public int MaPhieu { get; set; }
    public DateOnly? NgayDat { get; set; }
    public TimeOnly? GioBatDau { get; set; }
    public TimeOnly? GioKetThuc { get; set; }
    public string? TrangThai { get; set; }
    public decimal? TongTien { get; set; }
    public string? TinhTrangTt { get; set; }
    public int? MaHoaDon { get; set; }
    public int? MaLoai { get; set; }
    public string? TenLoai { get; set; }
    public string? TenSan { get; set; }
    public string? TenKhachHang { get; set; }
    public string? DanhSachDichVu { get; set; }
}
