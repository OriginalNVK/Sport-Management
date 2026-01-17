using backend.Data;
using backend.DTOs;
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

		public async Task<ReceptionistCreatedResponse> GetReceptionistCreatedAsync(int maNv)
    {
        var tenDangNhap = await _context.TaiKhoans
            .AsNoTracking()
            .Where(tk => tk.MaNv == maNv)
            .Select(tk => tk.TenDangNhap)
            .FirstOrDefaultAsync();

        if (string.IsNullOrWhiteSpace(tenDangNhap))
            throw new InvalidOperationException("Không tìm thấy tài khoản theo maNv.");

        return new ReceptionistCreatedResponse
        {
            MaNv = maNv,
            TenDangNhap = tenDangNhap
        };
    }
    public async Task<int> CreateBookingAsync(CreateBookingRequest request)
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
            NguoiTaoPhieu = string.IsNullOrWhiteSpace(request.NguoiTaoPhieu) ? null : request.NguoiTaoPhieu,
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
        var query = _context.PhieuDatSans
            .Include(p => p.MaSanNavigation)
                .ThenInclude(s => s!.MaLoaiNavigation)
            .Include(p => p.HoaDons)
            .AsQueryable();

        // Filter by user type
        if (maKh.HasValue)
        {
            query = query.Where(p => p.MaKh == maKh.Value);
        }
        else if (maNv.HasValue)
        {
            query = query.Where(p => p.NguoiTaoPhieu != null);
        }

        var bookings = await query
            .OrderByDescending(p => p.NgayTaoPhieu)
            .Select(p => new
            {
                p.MaPhieu,
                p.NgayDat,
                p.GioBatDau,
                p.GioKetThuc,
                p.TrangThai,
                p.TongTien,
                p.TinhTrangTt,
                MaLoai = p.MaSanNavigation!.MaLoai,
                TenSan = p.MaSanNavigation!.TenSan,
                MaHoaDon = p.HoaDons.FirstOrDefault() != null ? p.HoaDons.FirstOrDefault()!.MaHd : (int?)null
            })
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
                TinhTrangTt = b.TinhTrangTt
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
