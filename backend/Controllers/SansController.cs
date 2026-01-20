using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

public class UpdateFieldStatusRequest
{
    public string TinhTrang { get; set; } = string.Empty;
}

public class UpdateFieldStatusRequest
{
    public string TinhTrang { get; set; } = string.Empty;
}

[ApiController]
[Route("api/v1/[controller]")]
public class SansController : ControllerBase
{
    private readonly SportContext _context;
    private readonly ILogger<SansController> _logger;
    
    public SansController(SportContext context, ILogger<SansController> logger)
    {
        _context = context;
        _logger = logger;
    }
    private readonly ILogger<SansController> _logger;
    
    public SansController(SportContext context, ILogger<SansController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _context.Sans
            .AsNoTracking()
            .Include(s => s.MaLoaiNavigation)
            .Include(s => s.MaCoSoNavigation)
            .Include(s => s.MaLoaiNavigation)
            .Include(s => s.MaCoSoNavigation)
            .Select(s => new {
                maSan = s.MaSan,
                tenSan = s.TenSan,
                tinhTrang = s.TinhTrang,
                maLoai = s.MaLoai,
                tenLoai = s.MaLoaiNavigation != null ? s.MaLoaiNavigation.TenLoai : null,
                maCoSo = s.MaCoSo,
                tenCoSo = s.MaCoSoNavigation != null ? s.MaCoSoNavigation.TenCoSo : null,
                sucChua = s.SucChua
                tenLoai = s.MaLoaiNavigation != null ? s.MaLoaiNavigation.TenLoai : null,
                maCoSo = s.MaCoSo,
                tenCoSo = s.MaCoSoNavigation != null ? s.MaCoSoNavigation.TenCoSo : null,
                sucChua = s.SucChua
            })
            .ToListAsync();

        return Ok(new { success = true, data, count = data.Count });
    }

    /// <summary>
    /// Cập nhật trạng thái sân (dành cho nhân viên kỹ thuật)
    /// </summary>
    [HttpPut("{maSan}/status")]
public async Task<IActionResult> UpdateFieldStatus(int maSan, [FromBody] UpdateFieldStatusRequest request)
{
    try
    {
        // 1) Validate trạng thái
        var validStatuses = new[] { "con_trong", "dang_su_dung", "bao_tri", "khong_kha_dung" };
        var tinhTrang = (request.TinhTrang ?? "").Trim().ToLowerInvariant();
        if (!validStatuses.Contains(tinhTrang))
        {
            return BadRequest(new { success = false, message = "Trạng thái không hợp lệ" });
        }

        // 2) Check HOLD: nếu sân đang được giữ chỗ thì CHẶN update
        var now = DateTime.UtcNow;
        var hasActiveHold = await _context.SanHolds
            .AnyAsync(h => h.MaSan == maSan && h.ExpiresAt > now);

        if (hasActiveHold)
        {
            return Conflict(new
            {
                success = false,
                message = "Sân đang được giữ chỗ, không thể cập nhật trạng thái lúc này."
            });
        }

        // 3) Tìm sân
        var field = await _context.Sans.FindAsync(maSan);
        if (field == null)
        {
            return NotFound(new { success = false, message = "Không tìm thấy sân" });
        }

        // 4) Update
        field.TinhTrang = tinhTrang;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated field {MaSan} status to {TinhTrang}", maSan, tinhTrang);

        return Ok(new
        {
            success = true,
            message = "Cập nhật trạng thái sân thành công",
            data = new { maSan, tinhTrang = field.TinhTrang }
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error updating field status");
        return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi khi cập nhật trạng thái sân" });
    }
}

}