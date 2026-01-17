using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

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

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _context.Sans
            .AsNoTracking()
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
            var field = await _context.Sans.FindAsync(maSan);
            if (field == null)
            {
                return NotFound(new { message = "Không tìm thấy sân" });
            }

            // Validate trạng thái
            var validStatuses = new[] { "san_sang", "dang_su_dung", "bao_tri", "khong_kha_dung" };
            if (!validStatuses.Contains(request.TinhTrang))
            {
                return BadRequest(new { message = "Trạng thái không hợp lệ" });
            }

            field.TinhTrang = request.TinhTrang;
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Updated field {maSan} status to {request.TinhTrang}");
            return Ok(new { message = "Cập nhật trạng thái sân thành công", tinhTrang = field.TinhTrang });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating field status: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật trạng thái sân" });
        }
    }
}
