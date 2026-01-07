using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

/// <summary>
/// Controller xử lý các API liên quan đến Ca trực và Phân công ca
/// </summary>
[ApiController]
[Route("api/v1/shifts")]
public class ShiftController : ControllerBase
{
    private readonly IShiftService _shiftService;
    private readonly ILogger<ShiftController> _logger;

    public ShiftController(IShiftService shiftService, ILogger<ShiftController> logger)
    {
        _shiftService = shiftService;
        _logger = logger;
    }

    #region Shift Management

    /// <summary>
    /// Lấy danh sách tất cả ca trực
    /// </summary>
    /// <returns>Danh sách ca trực</returns>
    [HttpGet]
    [ProducesResponseType(typeof(List<ShiftDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllShifts()
    {
        try
        {
            var shifts = await _shiftService.GetAllShiftsAsync();
            return Ok(shifts);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting all shifts: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách ca trực" });
        }
    }

    /// <summary>
    /// Lấy thông tin chi tiết ca trực theo mã
    /// </summary>
    /// <param name="maCa">Mã ca trực</param>
    /// <returns>Thông tin ca trực</returns>
    [HttpGet("{maCa}")]
    [ProducesResponseType(typeof(ShiftDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetShiftById(int maCa)
    {
        try
        {
            var shift = await _shiftService.GetShiftByIdAsync(maCa);
            if (shift == null)
            {
                return NotFound(new { message = "Không tìm thấy ca trực" });
            }

            return Ok(shift);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting shift {maCa}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin ca trực" });
        }
    }

    /// <summary>
    /// Lấy danh sách ca trực theo cơ sở
    /// </summary>
    /// <param name="maCoSo">Mã cơ sở</param>
    /// <returns>Danh sách ca trực</returns>
    [HttpGet("facility/{maCoSo}")]
    [ProducesResponseType(typeof(List<ShiftDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetShiftsByFacility(int maCoSo)
    {
        try
        {
            var shifts = await _shiftService.GetShiftsByCoSoAsync(maCoSo);
            return Ok(shifts);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting shifts for facility {maCoSo}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách ca trực" });
        }
    }

    /// <summary>
    /// Lấy danh sách ca trực theo ngày
    /// </summary>
    /// <param name="date">Ngày (YYYY-MM-DD)</param>
    /// <returns>Danh sách ca trực</returns>
    [HttpGet("date/{date}")]
    [ProducesResponseType(typeof(List<ShiftDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetShiftsByDate(DateTime date)
    {
        try
        {
            var shifts = await _shiftService.GetShiftsByDateAsync(date);
            return Ok(shifts);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting shifts for date {date}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách ca trực" });
        }
    }

    /// <summary>
    /// Tạo mới ca trực
    /// </summary>
    /// <param name="request">Thông tin ca trực mới</param>
    /// <returns>Mã ca trực mới</returns>
    [HttpPost]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateShift([FromBody] CreateShiftRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var maCa = await _shiftService.CreateShiftAsync(request);
            return CreatedAtAction(nameof(GetShiftById), new { maCa }, new { message = "Tạo ca trực thành công", maCa });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Failed to create shift: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error creating shift: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo ca trực" });
        }
    }

    /// <summary>
    /// Cập nhật thông tin ca trực
    /// </summary>
    /// <param name="maCa">Mã ca trực</param>
    /// <param name="request">Thông tin cập nhật</param>
    /// <returns>Kết quả cập nhật</returns>
    [HttpPut("{maCa}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateShift(int maCa, [FromBody] UpdateShiftRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _shiftService.UpdateShiftAsync(maCa, request);
            if (!result)
            {
                return NotFound(new { message = "Không tìm thấy ca trực" });
            }

            return Ok(new { message = "Cập nhật ca trực thành công" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Failed to update shift {maCa}: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating shift {maCa}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật ca trực" });
        }
    }

    /// <summary>
    /// Xóa ca trực
    /// </summary>
    /// <param name="maCa">Mã ca trực</param>
    /// <returns>Kết quả xóa</returns>
    [HttpDelete("{maCa}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteShift(int maCa)
    {
        try
        {
            var result = await _shiftService.DeleteShiftAsync(maCa);
            if (!result)
            {
                return NotFound(new { message = "Không tìm thấy ca trực" });
            }

            return Ok(new { message = "Xóa ca trực thành công" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Failed to delete shift {maCa}: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error deleting shift {maCa}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa ca trực" });
        }
    }

    #endregion

    #region Shift Assignment

    /// <summary>
    /// Lấy danh sách tất cả phân công ca
    /// </summary>
    /// <returns>Danh sách phân công ca</returns>
    [HttpGet("assignments")]
    [ProducesResponseType(typeof(List<ShiftAssignmentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllShiftAssignments()
    {
        try
        {
            var assignments = await _shiftService.GetAllShiftAssignmentsAsync();
            return Ok(assignments);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting all shift assignments: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách phân công ca" });
        }
    }

    /// <summary>
    /// Lấy danh sách phân công ca theo nhân viên
    /// </summary>
    /// <param name="maNv">Mã nhân viên</param>
    /// <returns>Danh sách phân công ca</returns>
    [HttpGet("assignments/employee/{maNv}")]
    [ProducesResponseType(typeof(List<ShiftAssignmentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetShiftAssignmentsByEmployee(int maNv)
    {
        try
        {
            var assignments = await _shiftService.GetShiftAssignmentsByEmployeeAsync(maNv);
            return Ok(assignments);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting shift assignments for employee {maNv}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách phân công ca" });
        }
    }

    /// <summary>
    /// Lấy danh sách phân công ca theo ca trực
    /// </summary>
    /// <param name="maCa">Mã ca trực</param>
    /// <returns>Danh sách phân công ca</returns>
    [HttpGet("assignments/shift/{maCa}")]
    [ProducesResponseType(typeof(List<ShiftAssignmentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetShiftAssignmentsByShift(int maCa)
    {
        try
        {
            var assignments = await _shiftService.GetShiftAssignmentsByShiftAsync(maCa);
            return Ok(assignments);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting shift assignments for shift {maCa}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách phân công ca" });
        }
    }

    /// <summary>
    /// Phân công ca trực cho nhân viên
    /// </summary>
    /// <param name="request">Thông tin phân công ca</param>
    /// <returns>Mã phân công mới</returns>
    [HttpPost("assignments")]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignShift([FromBody] AssignShiftRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var maPc = await _shiftService.AssignShiftAsync(request);
            return CreatedAtAction(nameof(GetAllShiftAssignments), new { }, new { message = "Phân công ca thành công", maPc });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Failed to assign shift: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error assigning shift: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi phân công ca" });
        }
    }

    /// <summary>
    /// Xóa phân công ca
    /// </summary>
    /// <param name="maPc">Mã phân công</param>
    /// <returns>Kết quả xóa</returns>
    [HttpDelete("assignments/{maPc}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveShiftAssignment(int maPc)
    {
        try
        {
            var result = await _shiftService.RemoveShiftAssignmentAsync(maPc);
            if (!result)
            {
                return NotFound(new { message = "Không tìm thấy phân công ca" });
            }

            return Ok(new { message = "Xóa phân công ca thành công" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Failed to remove shift assignment {maPc}: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error removing shift assignment {maPc}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa phân công ca" });
        }
    }

    #endregion
}
