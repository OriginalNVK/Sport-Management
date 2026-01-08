using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;
    private readonly ILogger<BookingsController> _logger;

    public BookingsController(IBookingService bookingService, ILogger<BookingsController> logger)
    {
        _bookingService = bookingService;
        _logger = logger;
    }

    // 1) Check sân trống theo ngày/giờ
    [HttpPost("check-availability")]
    [ProducesResponseType(typeof(AvailabilityResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<object>> CheckAvailability([FromBody] CheckFieldAvailabilityRequest request)
    {
        try
        {
            var result = await _bookingService.CheckAvailabilityAsync(request);

            return Ok(new
            {
                success = true,
                message = result.Message,
                data = result
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Lỗi check availability: {Message}", ex.Message);
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi không xác định khi check availability");
            return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi khi kiểm tra sân trống" });
        }
    }

    // 2) Tạo phiếu đặt sân + ghi lịch đặt
    // Nếu bạn có JWT: bật Authorize và lấy username từ token
    // [Authorize]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<object>> CreateBooking([FromBody] CreateBookingRequest request)
    {
        try
        {
            // Nếu bạn dùng JWT và claim name:
            // var username = User?.Identity?.Name;
            string? username = null;

            var maPhieu = await _bookingService.CreateBookingAsync(request, username);

            _logger.LogInformation("Tạo phiếu đặt sân thành công. ma_phieu={MaPhieu}", maPhieu);

            return Ok(new
            {
                success = true,
                message = "Đặt sân thành công",
                data = new { ma_phieu = maPhieu }
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Lỗi đặt sân: {Message}", ex.Message);
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi không xác định khi đặt sân");
            return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi khi đặt sân" });
        }
    }

    // 3) Lấy danh sách phiếu đặt sân theo khách
    [HttpGet("customer/{maKh}")]
    [ProducesResponseType(typeof(List<BookingResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<object>> GetByCustomer(int maKh)
    {
        try
        {
            var data = await _bookingService.GetBookingsByCustomerAsync(maKh);
            return Ok(new { success = true, data, count = data.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi lấy danh sách đặt sân của khách {MaKh}", maKh);
            return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi khi lấy danh sách đặt sân" });
        }
    }

    // 4) Hủy phiếu đặt sân (xóa lịch để trả sân trống)
    // [Authorize]
    [HttpDelete("{maPhieu}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<object>> Cancel(int maPhieu)
    {
        try
        {
            string? username = null;

            var ok = await _bookingService.CancelBookingAsync(maPhieu, username);
            if (!ok)
                return NotFound(new { success = false, message = $"Không tìm thấy phiếu {maPhieu}" });

            return Ok(new { success = true, message = "Hủy đặt sân thành công" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Lỗi hủy đặt sân: {Message}", ex.Message);
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi không xác định khi hủy phiếu {MaPhieu}", maPhieu);
            return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi khi hủy đặt sân" });
        }
    }
}
