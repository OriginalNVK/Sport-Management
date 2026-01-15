using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class KhachHangController : ControllerBase
{
    private readonly SportContext _context;
    public KhachHangController(SportContext context) => _context = context;

    [HttpGet("by-phone")]
    public async Task<IActionResult> GetByPhone([FromQuery] string sdt)
    {
        if (string.IsNullOrWhiteSpace(sdt))
            return BadRequest(new { success = false, message = "Thiếu sdt" });

        var phone = sdt.Trim();

        var kh = await _context.KhachHangs
            .AsNoTracking()
            .Where(x => x.Sdt == phone)
            .Select(x => new
            {
                maKh = x.MaKh,
                hoTen = x.HoTen,
                sdt = x.Sdt,
                email = x.Email
            })
            .FirstOrDefaultAsync();

        return Ok(new { success = true, data = kh }); 
    }
}
