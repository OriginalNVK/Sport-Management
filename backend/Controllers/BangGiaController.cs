using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class BangGiaController : ControllerBase
{
    private readonly SportContext _context;
    public BangGiaController(SportContext context) => _context = context;

    [HttpGet("price")]
    public async Task<IActionResult> GetPrice([FromQuery] int maLoai, [FromQuery] string loaiNgay, [FromQuery] string khungGio)
    {
        loaiNgay = (loaiNgay ?? "").Trim().ToLower();
        khungGio = (khungGio ?? "").Trim().ToLower();

        if (maLoai <= 0)
            return BadRequest(new { success = false, message = "maLoai không hợp lệ" });

        if (loaiNgay is not ("thuong" or "cuoi_tuan" or "le"))
            return BadRequest(new { success = false, message = "loaiNgay không hợp lệ" });

        if (khungGio is not ("sang" or "chieu" or "toi"))
            return BadRequest(new { success = false, message = "khungGio không hợp lệ" });

        var gia = await _context.BangGia
            .AsNoTracking()
            .Where(x => x.MaLoai == maLoai && x.LoaiNgay == loaiNgay && x.KhungGio == khungGio)
            .Select(x => x.Gia)
            .FirstOrDefaultAsync();

        if (gia == 0)
            return NotFound(new { success = false, message = "Không tìm thấy giá phù hợp" });

        return Ok(new { success = true, data = new { gia } });
    }
}
