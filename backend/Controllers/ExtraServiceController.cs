using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class BookingExtrasController : ControllerBase
{
    private readonly IBookingExtrasService _service;
    private readonly ILogger<BookingExtrasController> _logger;

    public BookingExtrasController(IBookingExtrasService service, ILogger<BookingExtrasController> logger)
    {
        _service = service;
        _logger = logger;
    }

    // POST: /api/v1/bookingextras/service
    [HttpPost("service")]
    public async Task<ActionResult<object>> AddService([FromBody] AddChiTietDvRequest request)
    {
        try
        {
            var added = await _service.AddChiTietDvAsync(request);
            return Ok(new { success = true, message = "Thêm dịch vụ thành công", data = added });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Lỗi thêm dịch vụ: {Message}", ex.Message);
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi không xác định khi thêm dịch vụ");
            return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi khi thêm dịch vụ" });
        }
    }

    // POST: /api/v1/bookingextras/hlv
    [HttpPost("hlv")]
    public async Task<ActionResult<object>> AddHlv([FromBody] AddLichHlvRequest request)
    {
        try
        {
            var added = await _service.AddLichHlvAsync(request);
            return Ok(new { success = true, message = "Đặt HLV thành công", data = added });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Lỗi đặt HLV: {Message}", ex.Message);
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi không xác định khi đặt HLV");
            return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi khi đặt HLV" });
        }
    }

    // GET: /api/v1/bookingextras/{ma_phieu}/service
    [HttpGet("{ma_phieu}/service")]
    public async Task<ActionResult<object>> GetServices(int ma_phieu)
    {
        var data = await _service.GetChiTietDvByPhieuAsync(ma_phieu);
        return Ok(new { success = true, data, count = data.Count });
    }

    // GET: /api/v1/bookingextras/{ma_phieu}/hlv
    [HttpGet("{ma_phieu}/hlv")]
    public async Task<ActionResult<object>> GetHlv(int ma_phieu)
    {
        var data = await _service.GetLichHlvByPhieuAsync(ma_phieu);
        return Ok(new { success = true, data, count = data.Count });
    }

    // DELETE: /api/v1/bookingextras/service/{ma_ct}
    [HttpDelete("service/{ma_ct}")]
    public async Task<ActionResult<object>> DeleteService(int ma_ct)
    {
        try
        {
            var ok = await _service.DeleteChiTietDvAsync(ma_ct);
            if (!ok) return NotFound(new { success = false, message = "Không tìm thấy chi tiết dịch vụ" });
            return Ok(new { success = true, message = "Xóa dịch vụ thành công" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // DELETE: /api/v1/bookingextras/hlv/{ma_lich}
    [HttpDelete("hlv/{ma_lich}")]
    public async Task<ActionResult<object>> DeleteHlv(int ma_lich)
    {
        try
        {
            var ok = await _service.DeleteLichHlvAsync(ma_lich);
            if (!ok) return NotFound(new { success = false, message = "Không tìm thấy lịch HLV" });
            return Ok(new { success = true, message = "Hủy lịch HLV thành công" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // GET: /api/v1/bookingextras/service/{ma_dv}?ma_co_so=1
    [HttpGet("service/{ma_dv}")]
    public async Task<ActionResult<object>> GetServiceInfo(int ma_dv, [FromQuery] int? ma_co_so)
    {
        try
        {
            var data = await _service.GetServiceInfoAsync(ma_dv, ma_co_so);
            if (data == null)
                return NotFound(new { success = false, message = "Không tìm thấy dịch vụ" });

            return Ok(new { success = true, data });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi không xác định khi lấy thông tin dịch vụ");
            return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi khi lấy thông tin dịch vụ" });
        }
    }
    // GET: /api/v1/bookingextras/services/{maCoSo}
    [HttpGet("services/{maCoSo}")]
    public async Task<ActionResult<object>> GetServiceList(int maCoSo)
    {
        var data = await _service.GetServiceListAsync(maCoSo);
        return Ok(new
        {
            success = true,
            data,
            count = data.Count
        });
    }

}
