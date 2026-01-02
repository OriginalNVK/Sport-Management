using backend.Data;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using System.Data;

namespace backend.Services;

public class InvoiceService : IInvoiceService
{
    private readonly SportContext _context;

    public InvoiceService(SportContext context)
    {
        _context = context;
    }

    public async Task<int> CreateInvoiceAsync(CreateInvoiceRequest request)
    {
        try
        {
            // Tạo DataTable cho danh sách mã ưu đãi
            var uuDaiTable = new DataTable();
            uuDaiTable.Columns.Add("ma_uu_dai", typeof(int));
            
            if (request.DanhSachMaUuDai != null && request.DanhSachMaUuDai.Any())
            {
                foreach (var maUuDai in request.DanhSachMaUuDai)
                {
                    uuDaiTable.Rows.Add(maUuDai);
                }
            }

            // Tạo các parameters cho stored procedure
            var parameters = new[]
            {
                new SqlParameter("@MaPhieu", SqlDbType.Int) { Value = request.MaPhieu },
                new SqlParameter("@DanhSachMaUuDai", SqlDbType.Structured) 
                { 
                    Value = uuDaiTable,
                    TypeName = "ListMaUuDai"
                },
                new SqlParameter("@PhanTramThue", SqlDbType.Decimal) 
                { 
                    Value = request.PhanTramThue,
                    Precision = 5,
                    Scale = 2
                }
            };

            // Gọi stored procedure và lấy kết quả
            var result = await _context.Database
                .SqlQueryRaw<InvoiceResultDto>(
                    "EXEC sp_TaoHoaDon @MaPhieu, @DanhSachMaUuDai, @PhanTramThue",
                    parameters)
                .ToListAsync();

            if (result != null && result.Any())
            {
                return result.First().MaHd;
            }

            throw new InvalidOperationException("Không thể tạo hóa đơn");
        }
        catch (SqlException ex)
        {
            throw new InvalidOperationException($"Lỗi khi tạo hóa đơn: {ex.Message}", ex);
        }
    }

    public async Task<InvoiceResponse?> GetInvoiceByIdAsync(int maHd)
    {
        var invoice = await _context.HoaDons
            .Where(h => h.MaHd == maHd)
            .Select(h => new InvoiceResponse
            {
                MaHd = h.MaHd,
                MaPhieu = h.MaPhieu ?? 0,
                NgayLap = h.NgayLap ?? DateTime.Now,
                TongTien = h.TongTien ?? 0,
                Thue = h.Thue ?? 0,
                GiamGia = h.GiamGia ?? 0,
                TongCuoi = h.TongCuoi ?? 0,
                TinhTrangTt = h.MaPhieuNavigation!.TinhTrangTt,
                TenKhachHang = h.MaPhieuNavigation!.MaKhNavigation!.HoTen,
                TenSan = h.MaPhieuNavigation!.MaSanNavigation!.TenSan,
                NgayDat = h.MaPhieuNavigation!.NgayDat,
                GioBatDau = h.MaPhieuNavigation!.GioBatDau,
                GioKetThuc = h.MaPhieuNavigation!.GioKetThuc
            })
            .FirstOrDefaultAsync();

        return invoice;
    }

    public async Task<List<InvoiceResponse>> GetInvoicesByCustomerAsync(int maKh)
    {
        var invoices = await _context.HoaDons
            .Where(h => h.MaPhieuNavigation!.MaKh == maKh)
            .Select(h => new InvoiceResponse
            {
                MaHd = h.MaHd,
                MaPhieu = h.MaPhieu ?? 0,
                NgayLap = h.NgayLap ?? DateTime.Now,
                TongTien = h.TongTien ?? 0,
                Thue = h.Thue ?? 0,
                GiamGia = h.GiamGia ?? 0,
                TongCuoi = h.TongCuoi ?? 0,
                TinhTrangTt = h.MaPhieuNavigation!.TinhTrangTt,
                TenKhachHang = h.MaPhieuNavigation!.MaKhNavigation!.HoTen,
                TenSan = h.MaPhieuNavigation!.MaSanNavigation!.TenSan,
                NgayDat = h.MaPhieuNavigation!.NgayDat,
                GioBatDau = h.MaPhieuNavigation!.GioBatDau,
                GioKetThuc = h.MaPhieuNavigation!.GioKetThuc
            })
            .OrderByDescending(h => h.NgayLap)
            .ToListAsync();

        return invoices;
    }

    public async Task<List<InvoiceResponse>> GetAllInvoicesAsync(string? trangThai = null)
    {
        var query = _context.HoaDons.AsQueryable();

        // Lọc theo trạng thái nếu có
        if (!string.IsNullOrEmpty(trangThai))
        {
            query = query.Where(h => h.MaPhieuNavigation!.TinhTrangTt == trangThai);
        }

        var invoices = await query
            .Select(h => new InvoiceResponse
            {
                MaHd = h.MaHd,
                MaPhieu = h.MaPhieu ?? 0,
                NgayLap = h.NgayLap ?? DateTime.Now,
                TongTien = h.TongTien ?? 0,
                Thue = h.Thue ?? 0,
                GiamGia = h.GiamGia ?? 0,
                TongCuoi = h.TongCuoi ?? 0,
                TinhTrangTt = h.MaPhieuNavigation!.TinhTrangTt,
                TenKhachHang = h.MaPhieuNavigation!.MaKhNavigation!.HoTen,
                TenSan = h.MaPhieuNavigation!.MaSanNavigation!.TenSan,
                NgayDat = h.MaPhieuNavigation!.NgayDat,
                GioBatDau = h.MaPhieuNavigation!.GioBatDau,
                GioKetThuc = h.MaPhieuNavigation!.GioKetThuc
            })
            .OrderByDescending(h => h.NgayLap)
            .ToListAsync();

        return invoices;
    }

    public async Task<PaymentResponse> PayInvoiceAsync(PaymentRequest request)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Kiểm tra hóa đơn có tồn tại không
            var hoaDon = await _context.HoaDons
                .Include(h => h.MaPhieuNavigation)
                .FirstOrDefaultAsync(h => h.MaHd == request.MaHd);

            if (hoaDon == null)
                throw new InvalidOperationException($"Không tìm thấy hóa đơn với mã {request.MaHd}");

            // Kiểm tra trạng thái thanh toán
            if (hoaDon.MaPhieuNavigation!.TinhTrangTt == "da_tt")
                throw new InvalidOperationException("Hóa đơn đã được thanh toán");

            // Kiểm tra số tiền thanh toán
            if (request.SoTien < (hoaDon.TongCuoi ?? 0))
                throw new InvalidOperationException($"Số tiền thanh toán không đủ. Cần thanh toán: {(hoaDon.TongCuoi ?? 0):N0}đ");

            // Kiểm tra người thanh toán có tồn tại không
            var taiKhoan = await _context.TaiKhoans
                .FirstOrDefaultAsync(t => t.TenDangNhap == request.NguoiTt);

            if (taiKhoan == null)
                throw new InvalidOperationException($"Không tìm thấy tài khoản {request.NguoiTt}");

            // Tạo mã thanh toán mới
            var maxMaTt = await _context.ThanhToans.MaxAsync(t => (int?)t.MaTt) ?? 0;
            var newMaTt = maxMaTt + 1;

            // Tạo thanh toán mới
            var thanhToan = new ThanhToan
            {
                MaTt = newMaTt,
                MaHd = request.MaHd,
                SoTien = request.SoTien,
                HinhThuc = request.HinhThuc,
                NguoiTt = request.NguoiTt,
                NgayTt = DateTime.Now,
                TrangThai = "thanh_cong"
            };

            _context.ThanhToans.Add(thanhToan);
            await _context.SaveChangesAsync();

            // Cập nhật tình trạng thanh toán của phiếu đặt sân
            hoaDon.MaPhieuNavigation.TinhTrangTt = "da_tt";
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return new PaymentResponse
            {
                MaTt = newMaTt,
                MaHd = request.MaHd,
                SoTien = request.SoTien,
                HinhThuc = request.HinhThuc,
                NguoiTt = request.NguoiTt,
                NgayTt = thanhToan.NgayTt ?? DateTime.Now,
                TrangThai = "thanh_cong",
                Message = $"Thanh toán thành công. Số tiền thừa: {(request.SoTien - (hoaDon.TongCuoi ?? 0)):N0}đ"
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> CancelInvoiceAsync(int maHd)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Kiểm tra hóa đơn có tồn tại không
            var hoaDon = await _context.HoaDons
                .Include(h => h.MaPhieuNavigation)
                .FirstOrDefaultAsync(h => h.MaHd == maHd);

            if (hoaDon == null)
                return false;

            // Kiểm tra đã thanh toán chưa
            if (hoaDon.MaPhieuNavigation!.TinhTrangTt == "da_tt")
                throw new InvalidOperationException("Không thể hủy hóa đơn đã thanh toán");

            // Cập nhật trạng thái phiếu đặt sân
            hoaDon.MaPhieuNavigation!.TrangThai = "huy";
            hoaDon.MaPhieuNavigation!.TinhTrangTt = "hoan_tien";

            // Xóa hóa đơn
            _context.HoaDons.Remove(hoaDon);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();
            return true;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
