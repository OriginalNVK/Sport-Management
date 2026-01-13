using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class SansController : ControllerBase
{
    private readonly SportContext _context;
    public SansController(SportContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _context.Sans
            .AsNoTracking()
            .Select(s => new {
                maSan = s.MaSan,
                tenSan = s.TenSan,
                tinhTrang = s.TinhTrang,
                maLoai = s.MaLoai,
                maCoSo = s.MaCoSo
            })
            .ToListAsync();

        return Ok(new { success = true, data, count = data.Count });
    }
}
