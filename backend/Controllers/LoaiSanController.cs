using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class LoaiSanController : ControllerBase
{
    private readonly SportContext _context;
    public LoaiSanController(SportContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _context.LoaiSans
            .AsNoTracking()
            .Select(x => new {
                maLoai = x.MaLoai,
                tenLoai = x.TenLoai,
                donViTinh = x.DonViTinh,
                moTa = x.MoTa
            })
            .ToListAsync();

        return Ok(new { success = true, data, count = data.Count });
    }
}
