using backend.DTOs;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class BookingExtrasService : IBookingExtrasService
{
    private readonly SportContext _db;

    public BookingExtrasService(SportContext db)
    {
        _db = db;
    }
    public async Task<ChiTietDvResponse> AddChiTietDvAsync(AddChiTietDvRequest req)
    {
        if (req.so_luong <= 0) throw new InvalidOperationException("Số lượng phải > 0.");

        await using var tx = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
        // await using var tx = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted);

        var phieu = await _db.PhieuDatSans
            .FirstOrDefaultAsync(x => x.MaPhieu == req.ma_phieu);

        if (phieu == null) throw new InvalidOperationException("Không tìm thấy phiếu đặt sân.");
        if (phieu.TrangThai == "huy") throw new InvalidOperationException("Phiếu đã hủy, không thể thêm dịch vụ.");

        var maCoSo = await _db.Sans
            .Where(s => s.MaSan == phieu.MaSan)
            .Select(s => s.MaCoSo)
            .FirstOrDefaultAsync();

        if (maCoSo == 0) throw new InvalidOperationException("Không xác định cơ sở của sân.");

        var dv = await _db.DichVus.FirstOrDefaultAsync(x => x.MaDv == req.ma_dv);
        if (dv == null) throw new InvalidOperationException("Không tìm thấy dịch vụ.");
        if (dv.TrangThai != null && dv.TrangThai.ToLower() == "ngung")
            throw new InvalidOperationException("Dịch vụ đang ngừng hoạt động.");

        var donGia = dv.DonGia ?? 0m;

        var ton = await _db.TonKhoDichVus
            .FromSqlInterpolated($@"
                SELECT *
                FROM ton_kho_dich_vu WITH (UPDLOCK, ROWLOCK)
                WHERE ma_dv = {req.ma_dv} AND ma_co_so = {maCoSo}")
            .FirstOrDefaultAsync();
        
        await Task.Delay(1000);

        if (ton != null)
        {
            if (ton.SoLuongTon < req.so_luong)
                throw new InvalidOperationException("Không đủ số lượng tồn cho dịch vụ này.");

            ton.SoLuongTon -= req.so_luong;
            ton.NgayCapNhat = DateTime.UtcNow;
        }
        
        var existed = await _db.ChiTietDvs
            .FirstOrDefaultAsync(x => x.MaPhieu == req.ma_phieu && x.MaDv == req.ma_dv);

        ChiTietDv ct;
        decimal deltaThanhTien = donGia * req.so_luong; 

        if (existed != null)
        {
            existed.SoLuong = (existed.SoLuong ?? 0) + req.so_luong;
            existed.DonGia = donGia;
            existed.ThanhTien = (existed.SoLuong ?? 0) * donGia;

            ct = existed;
        }
        else
        {
            // var nextMaCt = (await _db.ChiTietDvs.MaxAsync(x => (int?)x.MaCt) ?? 0) + 1;

            ct = new ChiTietDv
            {
                // MaCt = nextMaCt,
                MaPhieu = req.ma_phieu,
                MaDv = req.ma_dv,
                SoLuong = req.so_luong,
                DonGia = donGia,
                ThanhTien = deltaThanhTien
            };

            _db.ChiTietDvs.Add(ct);
        }

        phieu.TongTien += deltaThanhTien;

        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        return new ChiTietDvResponse
        {
            ma_ct = ct.MaCt,
            ma_phieu = ct.MaPhieu ?? throw new InvalidOperationException("ChiTietDv.MaPhieu bị null"),
            ma_dv = ct.MaDv ?? throw new InvalidOperationException("ChiTietDv.MaDv bị null"),
            ten_dv = dv.TenDv,
            so_luong = ct.SoLuong ?? throw new InvalidOperationException("ChiTietDv.SoLuong bị null"),
            don_gia = ct.DonGia ?? 0m,
            thanh_tien = ct.ThanhTien ?? 0m
        };
    }

    public async Task<LichHlvResponse> AddLichHlvAsync(AddLichHlvRequest req)
    {
        if (req.gio_bat_dau >= req.gio_ket_thuc)
            throw new InvalidOperationException("Giờ bắt đầu phải < giờ kết thúc.");

        await using var tx = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

        var phieu = await _db.PhieuDatSans.FirstOrDefaultAsync(x => x.MaPhieu == req.ma_phieu);
        if (phieu == null) throw new InvalidOperationException("Không tìm thấy phiếu đặt sân.");
        if (phieu.TrangThai == "huy") throw new InvalidOperationException("Phiếu đã hủy, không thể đặt HLV.");

        var hlv = await _db.HuanLuyenViens.FirstOrDefaultAsync(x => x.MaHlv == req.ma_hlv);
        if (hlv == null) throw new InvalidOperationException("Không tìm thấy huấn luyện viên.");

        // Check trùng lịch theo cùng ngày đặt sân:
        // lich_hlv không có ngày => lấy ngày từ phieu_dat_san của các lịch đã đặt.
        var ngayDat = phieu.NgayDat;

        var conflict = await _db.LichHlvs
            .Join(_db.PhieuDatSans,
                l => l.MaPhieu,
                p => p.MaPhieu,
                (l, p) => new { l, p })
            .AnyAsync(x =>
                x.l.MaHlv == req.ma_hlv &&
                x.p.NgayDat == ngayDat &&
                x.l.GioBatDau < req.gio_ket_thuc &&
                req.gio_bat_dau < x.l.GioKetThuc
            );

        if (conflict) throw new InvalidOperationException("HLV bị trùng lịch trong ngày này.");

        // Tính tiền theo giờ (giả sử gia_theo_gio)
        var donGia = hlv.GiaTheoGio ?? 0m;
        var hours = (decimal)(req.gio_ket_thuc.ToTimeSpan() - req.gio_bat_dau.ToTimeSpan()).TotalHours;
        if (hours <= 0) throw new InvalidOperationException("Thời lượng thuê không hợp lệ.");

        var thanhTien = donGia * hours;

        var lich = new LichHlv
        {
            // ma_lich là IDENTITY -> EF tự sinh
            MaPhieu = req.ma_phieu,
            MaHlv = req.ma_hlv,
            GioBatDau = req.gio_bat_dau,
            GioKetThuc = req.gio_ket_thuc,
            DonGia = donGia,
            ThanhTien = thanhTien
        };

        _db.LichHlvs.Add(lich);
        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        return new LichHlvResponse
        {
            ma_lich = lich.MaLich,
            ma_phieu = lich.MaPhieu ?? throw new InvalidOperationException("LichHLV.MaPhieu bị null"),
            ma_hlv = lich.MaHlv ?? throw new InvalidOperationException("LichHLV.MaHlv bị null"),
            ho_ten = hlv.HoTen,
            gio_bat_dau = lich.GioBatDau ?? throw new InvalidOperationException("LichHLV.GioBatDau bị null"),
            gio_ket_thuc = lich.GioKetThuc ?? throw new InvalidOperationException("LichHLV.GioKetThuc bị null"),
            don_gia = lich.DonGia ?? 0m,
            thanh_tien = lich.ThanhTien ?? 0m
        };
    }

    public async Task<List<ChiTietDvResponse>> GetChiTietDvByPhieuAsync(int ma_phieu)
    {
        return await _db.ChiTietDvs
            .Where(x => x.MaPhieu == ma_phieu)
            .Join(_db.DichVus,
                ct => ct.MaDv,
                dv => dv.MaDv,
                (ct, dv) => new ChiTietDvResponse
                {
                    ma_ct = ct.MaCt,
                    ma_phieu = ct.MaPhieu ?? 0,
                    ma_dv = ct.MaDv ?? 0,
                    ten_dv = dv.TenDv,
                    so_luong = ct.SoLuong ?? 0,
                    don_gia = ct.DonGia ?? 0m,
                    thanh_tien = ct.ThanhTien ?? 0m
                })
            .ToListAsync();
    }

    public async Task<List<LichHlvResponse>> GetLichHlvByPhieuAsync(int ma_phieu)
    {
        return await _db.LichHlvs
            .Where(x => x.MaPhieu == ma_phieu)
            .Join(_db.HuanLuyenViens,
                l => l.MaHlv,
                h => h.MaHlv,
                (l, h) => new LichHlvResponse
                {
                    ma_lich = l.MaLich,
                    ma_phieu = l.MaPhieu ?? 0,
                    ma_hlv = l.MaHlv ?? 0,
                    ho_ten = h.HoTen,
                    gio_bat_dau = l.GioBatDau ?? TimeOnly.MinValue,
                    gio_ket_thuc = l.GioKetThuc ?? TimeOnly.MinValue,
                    don_gia = l.DonGia ?? 0m,
                    thanh_tien = l.ThanhTien ?? 0m
                })
            .ToListAsync();
    }

    public async Task<bool> DeleteChiTietDvAsync(int ma_ct)
    {
        await using var tx = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted);

        var ct = await _db.ChiTietDvs.FirstOrDefaultAsync(x => x.MaCt == ma_ct);
        if (ct == null) return false;

        // Hoàn tồn nếu có tồn kho theo cơ sở
        var phieu = await _db.PhieuDatSans.FirstOrDefaultAsync(x => x.MaPhieu == ct.MaPhieu);
        if (phieu == null) throw new InvalidOperationException("Phiếu đặt không tồn tại.");

        var maCoSo = await _db.Sans.Where(s => s.MaSan == phieu.MaSan).Select(s => s.MaCoSo).FirstOrDefaultAsync();
        var ton = await _db.TonKhoDichVus.FirstOrDefaultAsync(x => x.MaDv == ct.MaDv && x.MaCoSo == maCoSo);

        if (ton != null && ct.SoLuong.HasValue)
        {
            ton.SoLuongTon += ct.SoLuong.Value;
            ton.NgayCapNhat = DateTime.UtcNow;
        }
        // Giảm tổng tiền của phiếu
        phieu.TongTien -= ct.ThanhTien ?? 0m;
        
        _db.ChiTietDvs.Remove(ct);
        await _db.SaveChangesAsync();
        await tx.CommitAsync();
        return true;
    }

    public async Task<bool> DeleteLichHlvAsync(int ma_lich)
    {
        var lich = await _db.LichHlvs.FirstOrDefaultAsync(x => x.MaLich == ma_lich);
        if (lich == null) return false;

        _db.LichHlvs.Remove(lich);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<ServiceInfoResponse?> GetServiceInfoAsync(int maDv, int? maCoSo)
    {
        // dich_vu
        var dv = await _db.DichVus
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.MaDv == maDv);

        if (dv == null) return null;

        // ton_kho_dich_vu (optional theo cơ sở)
        int? soLuongTon = null;
        DateTime? ngayCapNhat = null;

        if (maCoSo.HasValue)
        {
            var tonKho = await _db.TonKhoDichVus
                .AsNoTracking()
                .Where(t => t.MaDv == maDv && t.MaCoSo == maCoSo.Value)
                .OrderByDescending(t => t.NgayCapNhat)
                .FirstOrDefaultAsync();

            if (tonKho != null)
            {
                soLuongTon = tonKho.SoLuongTon;
                ngayCapNhat = tonKho.NgayCapNhat;
            }
        }

        return new ServiceInfoResponse
        {
            MaDv = dv.MaDv,
            TenDv = dv.TenDv,
            LoaiDv = dv.LoaiDv,
            DonGia = dv.DonGia ?? 0m,
            DonVi = dv.DonVi,
            TrangThai = dv.TrangThai,

            MaCoSo = maCoSo,
            SoLuongTon = soLuongTon,
            NgayCapNhat = ngayCapNhat
        };
    }

    public async Task<List<ServiceInfoResponse>> GetServiceListAsync(int maCoSo)
    {
        // return await _db.DichVus
        //     .AsNoTracking()
        //     .Select(d => new ServiceInfoResponse
        //     {
        //         MaDv = d.MaDv,
        //         TenDv = d.TenDv,
        //         LoaiDv = d.LoaiDv,
        //         DonGia = d.DonGia ?? 0m,
        //         DonVi = d.DonVi,
        //         TrangThai = d.TrangThai
        //     })
        //     .ToListAsync();
        return await (
        from d in _db.DichVus.AsNoTracking()
        join t in _db.TonKhoDichVus.AsNoTracking()
            on d.MaDv equals t.MaDv
        where t.MaCoSo == maCoSo
              && t.SoLuongTon > 0
              && (d.TrangThai == null || d.TrangThai.ToLower() == "hoat_dong")
        select new ServiceInfoResponse
        {
            MaDv = d.MaDv,
            TenDv = d.TenDv,
            LoaiDv = d.LoaiDv,
            DonGia = d.DonGia ?? 0m,
            DonVi = d.DonVi,
            TrangThai = d.TrangThai,
            SoLuongTon = t.SoLuongTon   // ✅ rất nên trả về
        }
    ).ToListAsync();
    }

}
