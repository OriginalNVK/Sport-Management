using backend.DTOs;
using backend.Services;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly SportContext _context;

    private readonly IBookingService _bookingService;
    private readonly ILogger<BookingsController> _logger;

    public BookingsController(
    IBookingService bookingService,
    ILogger<BookingsController> logger,
    SportContext context)
    {
        _bookingService = bookingService;
        _logger = logger;
        _context = context ?? throw new ArgumentNullException(nameof(context));
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

        var gia = await _context.BangGiums
                .AsNoTracking()
                .Where(x =>
                        x.MaLoai == maLoai &&
                        (x.LoaiNgay ?? "").ToLower() == loaiNgay &&
                        (x.KhungGio ?? "").ToLower() == khungGio
                )
                .Select(x => (decimal?)x.Gia)   // để phân biệt null/not found
                .FirstOrDefaultAsync();

        if (gia == null)
            return NotFound(new { success = false, message = "Không tìm thấy giá phù hợp" });

        return Ok(new { success = true, data = new { gia } });
    }
		[HttpGet("receptionistcreated")]
		public async Task<IActionResult> GetReceptionistCreated([FromQuery] int maNv)
		{
				if (maNv <= 0)
						return BadRequest(new { success = false, message = "maNv không hợp lệ" });

				try
				{
						var result = await _bookingService.GetReceptionistCreatedAsync(maNv);

						return Ok(new
						{
								success = true,
								data = new
								{
										maNv = result.MaNv,
										ten_dang_nhap = result.TenDangNhap
								}
						});
				}
				catch (InvalidOperationException ex)
				{
						return NotFound(new { success = false, message = ex.Message });
				}
				catch (Exception)
				{
						return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi khi lấy tên đăng nhập" });
				}
		}
		[HttpPost("hold")]
		public async Task<IActionResult> HoldSan([FromBody] HoldSanRequest request)
		{
				try
				{
						var (token, expiresAt) = await _bookingService.HoldSanAsync(request);
						return Ok(new { success = true, message = "Giữ chỗ thành công", data = new { holdToken = token, expiresAt } });
				}
				catch (InvalidOperationException ex)
				{
						return Conflict(new { success = false, message = ex.Message });
				}
		}

		[HttpDelete("hold/{holdToken:guid}")]
		public async Task<IActionResult> ReleaseHold([FromRoute] Guid holdToken)
		{
				await _bookingService.ReleaseHoldAsync(holdToken);
				return Ok(new { success = true, message = "Đã nhả giữ chỗ" });
		}

		[HttpPost("confirm")]
		public async Task<IActionResult> ConfirmBooking([FromBody] ConfirmBookingRequest request)
		{
				try
				{
						var maPhieu = await _bookingService.ConfirmBookingAsync(request);
						return Ok(new { success = true, message = "Đặt sân thành công", data = new { ma_phieu = maPhieu } });
				}
				catch (InvalidOperationException ex)
				{
						return Conflict(new { success = false, message = ex.Message });
				}
		}
    // 2) Tạo phiếu đặt sân + ghi lịch đặt
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<object>> CreateBooking([FromBody] CreateBookingRequest request)
    {
        try
        {
            var maPhieu = await _bookingService.CreateBookingAsync(request);

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

    // 5) Lấy tất cả booking của user đang đăng nhập
    [HttpGet("me")]
    [ProducesResponseType(typeof(List<UserBookingDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<object>> GetMyBookings()
    {
        try
        {
            // Lấy thông tin user từ JWT token claims
            int? maKh = null;
            int? maNv = null;

            // Lấy ma_kh claim
            var maKhClaim = User.Claims.FirstOrDefault(c => c.Type == "ma_kh");
            if (maKhClaim != null && int.TryParse(maKhClaim.Value, out var khId))
            {
                maKh = khId;
            }

            // Lấy ma_nv claim
            var maNvClaim = User.Claims.FirstOrDefault(c => c.Type == "ma_nv");
            if (maNvClaim != null && int.TryParse(maNvClaim.Value, out var nvId))
            {
                maNv = nvId;
            }

            if (!maKh.HasValue && !maNv.HasValue)
            {
                return Unauthorized(new { success = false, message = "Không tìm thấy thông tin user trong token" });
            }

            var bookings = await _bookingService.GetMyBookingsAsync(maKh, maNv);

            return Ok(new
            {
                success = true,
                data = bookings,
                count = bookings.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách booking của user");
            return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi khi lấy danh sách booking" });
        }
    }
}
