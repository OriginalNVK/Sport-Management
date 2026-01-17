using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

/// <summary>
/// Controller xử lý các API liên quan đến Đơn nghỉ phép
/// </summary>
[ApiController]
[Route("api/v1/leave-requests")]
public class LeaveRequestController : ControllerBase
{
    private readonly ILeaveService _leaveService;
    private readonly ILogger<LeaveRequestController> _logger;

    public LeaveRequestController(ILeaveService leaveService, ILogger<LeaveRequestController> logger)
    {
        _leaveService = leaveService;
        _logger = logger;
    }

    /// <summary>
    /// Lấy danh sách tất cả đơn nghỉ phép
    /// </summary>
    /// <returns>Danh sách đơn nghỉ phép</returns>
    [HttpGet]
    [ProducesResponseType(typeof(List<LeaveRequestDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllLeaveRequests()
    {
        try
        {
            var leaveRequests = await _leaveService.GetAllLeaveRequestsAsync();
            return Ok(leaveRequests);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting all leave requests: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách đơn nghỉ phép" });
        }
    }

    /// <summary>
    /// Lấy thông tin chi tiết đơn nghỉ phép theo mã
    /// </summary>
    /// <param name="maDon">Mã đơn nghỉ phép</param>
    /// <returns>Thông tin đơn nghỉ phép</returns>
    [HttpGet("{maDon}")]
    [ProducesResponseType(typeof(LeaveRequestDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLeaveRequestById(int maDon)
    {
        try
        {
            var leaveRequest = await _leaveService.GetLeaveRequestByIdAsync(maDon);
            if (leaveRequest == null)
            {
                return NotFound(new { message = "Không tìm thấy đơn nghỉ phép" });
            }

            return Ok(leaveRequest);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting leave request {maDon}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin đơn nghỉ phép" });
        }
    }

    /// <summary>
    /// Lấy danh sách đơn nghỉ phép theo nhân viên
    /// </summary>
    /// <param name="maNv">Mã nhân viên</param>
    /// <returns>Danh sách đơn nghỉ phép</returns>
    [HttpGet("employee/{maNv}")]
    [ProducesResponseType(typeof(List<LeaveRequestDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLeaveRequestsByEmployee(int maNv)
    {
        try
        {
            var leaveRequests = await _leaveService.GetLeaveRequestsByEmployeeAsync(maNv);
            return Ok(leaveRequests);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting leave requests for employee {maNv}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách đơn nghỉ phép" });
        }
    }

    /// <summary>
    /// Lấy danh sách đơn nghỉ phép theo trạng thái
    /// </summary>
    /// <param name="trangThai">Trạng thái (cho_duyet, da_duyet, tu_choi)</param>
    /// <returns>Danh sách đơn nghỉ phép</returns>
    [HttpGet("status/{trangThai}")]
    [ProducesResponseType(typeof(List<LeaveRequestDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLeaveRequestsByStatus(string trangThai)
    {
        try
        {
            var leaveRequests = await _leaveService.GetLeaveRequestsByStatusAsync(trangThai);
            return Ok(leaveRequests);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting leave requests by status {trangThai}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách đơn nghỉ phép" });
        }
    }

    /// <summary>
    /// Tạo mới đơn nghỉ phép
    /// </summary>
    /// <param name="request">Thông tin đơn nghỉ phép mới</param>
    /// <returns>Mã đơn nghỉ phép mới</returns>
    [HttpPost]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateLeaveRequest([FromBody] CreateLeaveRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var maDon = await _leaveService.CreateLeaveRequestAsync(request);
            return CreatedAtAction(nameof(GetLeaveRequestById), new { maDon }, new { message = "Tạo đơn nghỉ phép thành công", maDon });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Failed to create leave request: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error creating leave request: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo đơn nghỉ phép" });
        }
    }

    /// <summary>
    /// Duyệt hoặc từ chối đơn nghỉ phép
    /// </summary>
    /// <param name="maDon">Mã đơn nghỉ phép</param>
    /// <param name="request">Trạng thái mới (da_duyet hoặc tu_choi)</param>
    /// <returns>Kết quả duyệt</returns>
    [HttpPut("{maDon}/approve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveLeaveRequest(int maDon, [FromBody] ApproveLeaveRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _leaveService.ApproveLeaveRequestAsync(maDon, request);
            if (!result)
            {
                return NotFound(new { message = "Không tìm thấy đơn nghỉ phép" });
            }

            var message = request.TrangThai == "da_duyet" ? "Duyệt đơn nghỉ phép thành công" : "Từ chối đơn nghỉ phép thành công";
            return Ok(new { message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Failed to approve leave request {maDon}: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error approving leave request {maDon}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi duyệt đơn nghỉ phép" });
        }
    }

    /// <summary>
    /// Xóa đơn nghỉ phép
    /// </summary>
    /// <param name="maDon">Mã đơn nghỉ phép</param>
    /// <returns>Kết quả xóa</returns>
    [HttpDelete("{maDon}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteLeaveRequest(int maDon)
    {
        try
        {
            var result = await _leaveService.DeleteLeaveRequestAsync(maDon);
            if (!result)
            {
                return NotFound(new { message = "Không tìm thấy đơn nghỉ phép" });
            }

            return Ok(new { message = "Xóa đơn nghỉ phép thành công" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Failed to delete leave request {maDon}: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error deleting leave request {maDon}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa đơn nghỉ phép" });
        }
    }
}
