using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

/// <summary>
/// Controller xử lý các API liên quan đến Authentication
/// </summary>
[ApiController]
[Route("api/v1")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Đăng nhập với tên đăng nhập và mật khẩu
    /// </summary>
    /// <param name="request">Thông tin đăng nhập (tên đăng nhập và mật khẩu)</param>
    /// <returns>Token, refresh token và thời gian hết hạn</returns>
    /// <response code="200">Đăng nhập thành công</response>
    /// <response code="400">Dữ liệu đầu vào không hợp lệ</response>
    /// <response code="401">Tên đăng nhập hoặc mật khẩu không đúng</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var response = await _authService.LoginAsync(request);

            if (response == null)
                return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng" });

            _logger.LogInformation($"User {request.TenDangNhap} logged in successfully");
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning($"Login failed for user {request.TenDangNhap}: {ex.Message}");
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error during login for user {request.TenDangNhap}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi trong quá trình đăng nhập" });
        }
    }

    /// <summary>
    /// Đăng ký tài khoản khách hàng mới
    /// </summary>
    /// <param name="request">Thông tin đăng ký khách hàng</param>
    /// <returns>Thông báo đăng ký thành công</returns>
    /// <response code="200">Đăng ký thành công</response>
    /// <response code="400">Dữ liệu đầu vào không hợp lệ hoặc tài khoản đã tồn tại</response>
    [HttpPost("register/customer")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegisterCustomer([FromBody] RegisterRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.RegisterCustomerAsync(request);
            _logger.LogInformation($"Customer {request.TenDangNhap} registered successfully");
            return Ok(new { message = result });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Customer registration failed for user {request.TenDangNhap}: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error during customer registration for user {request.TenDangNhap}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi trong quá trình đăng ký" });
        }
    }

    /// <summary>
    /// Đăng ký tài khoản nhân viên mới
    /// </summary>
    /// <param name="request">Thông tin đăng ký nhân viên</param>
    /// <returns>Thông báo đăng ký thành công</returns>
    /// <response code="200">Đăng ký thành công</response>
    /// <response code="400">Dữ liệu đầu vào không hợp lệ hoặc tài khoản đã tồn tại</response>
    [HttpPost("register/employee")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegisterEmployee([FromBody] RegisterEmployeeRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.RegisterEmployeeAsync(request);
            _logger.LogInformation($"Employee {request.TenDangNhap} registered successfully");
            return Ok(new { message = result });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Employee registration failed for user {request.TenDangNhap}: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error during employee registration for user {request.TenDangNhap}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi trong quá trình đăng ký" });
        }
    }
}
