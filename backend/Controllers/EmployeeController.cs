using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

/// <summary>
/// Controller xử lý các API liên quan đến Quản lý nhân viên
/// </summary>
[ApiController]
[Route("api/v1/employees")]
public class EmployeeController : ControllerBase
{
    private readonly IEmployeeService _employeeService;
    private readonly ILogger<EmployeeController> _logger;

    public EmployeeController(IEmployeeService employeeService, ILogger<EmployeeController> logger)
    {
        _employeeService = employeeService;
        _logger = logger;
    }

    /// <summary>
    /// Lấy danh sách tất cả nhân viên
    /// </summary>
    /// <returns>Danh sách nhân viên</returns>
    [HttpGet]
    [ProducesResponseType(typeof(List<EmployeeDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllEmployees()
    {
        try
        {
            var employees = await _employeeService.GetAllEmployeesAsync();
            return Ok(employees);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting all employees: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách nhân viên" });
        }
    }

    /// <summary>
    /// Lấy thông tin chi tiết nhân viên theo mã
    /// </summary>
    /// <param name="maNv">Mã nhân viên</param>
    /// <returns>Thông tin nhân viên</returns>
    [HttpGet("{maNv}")]
    [ProducesResponseType(typeof(EmployeeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEmployeeById(int maNv)
    {
        try
        {
            var employee = await _employeeService.GetEmployeeByIdAsync(maNv);
            if (employee == null)
            {
                return NotFound(new { message = "Không tìm thấy nhân viên" });
            }

            return Ok(employee);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting employee {maNv}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin nhân viên" });
        }
    }

    /// <summary>
    /// Lấy danh sách nhân viên theo cơ sở
    /// </summary>
    /// <param name="maCoSo">Mã cơ sở</param>
    /// <returns>Danh sách nhân viên</returns>
    [HttpGet("facility/{maCoSo}")]
    [ProducesResponseType(typeof(List<EmployeeDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEmployeesByFacility(int maCoSo)
    {
        try
        {
            var employees = await _employeeService.GetEmployeesByCoSoAsync(maCoSo);
            return Ok(employees);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting employees for facility {maCoSo}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách nhân viên" });
        }
    }

    /// <summary>
    /// Tạo mới nhân viên
    /// </summary>
    /// <param name="request">Thông tin nhân viên mới</param>
    /// <returns>Mã nhân viên mới</returns>
    [HttpPost]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var maNv = await _employeeService.CreateEmployeeAsync(request);
            return CreatedAtAction(nameof(GetEmployeeById), new { maNv }, new { message = "Tạo nhân viên thành công", maNv });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Failed to create employee: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error creating employee: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo nhân viên" });
        }
    }

    /// <summary>
    /// Cập nhật thông tin nhân viên
    /// </summary>
    /// <param name="maNv">Mã nhân viên</param>
    /// <param name="request">Thông tin cập nhật</param>
    /// <returns>Kết quả cập nhật</returns>
    [HttpPut("{maNv}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateEmployee(int maNv, [FromBody] UpdateEmployeeRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _employeeService.UpdateEmployeeAsync(maNv, request);
            if (!result)
            {
                return NotFound(new { message = "Không tìm thấy nhân viên" });
            }

            return Ok(new { message = "Cập nhật nhân viên thành công" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Failed to update employee {maNv}: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating employee {maNv}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật nhân viên" });
        }
    }

    /// <summary>
    /// Xóa nhân viên
    /// </summary>
    /// <param name="maNv">Mã nhân viên</param>
    /// <returns>Kết quả xóa</returns>
    [HttpDelete("{maNv}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteEmployee(int maNv)
    {
        try
        {
            var result = await _employeeService.DeleteEmployeeAsync(maNv);
            if (!result)
            {
                return NotFound(new { message = "Không tìm thấy nhân viên" });
            }

            return Ok(new { message = "Xóa nhân viên thành công" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Failed to delete employee {maNv}: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error deleting employee {maNv}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa nhân viên" });
        }
    }

    /// <summary>
    /// Kích hoạt tài khoản nhân viên
    /// </summary>
    /// <param name="maNv">Mã nhân viên</param>
    /// <returns>Kết quả kích hoạt</returns>
    [HttpPost("{maNv}/activate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ActivateAccount(int maNv)
    {
        try
        {
            var result = await _employeeService.ActivateAccountAsync(maNv);
            if (!result)
            {
                return NotFound(new { message = "Không tìm thấy tài khoản" });
            }

            return Ok(new { message = "Kích hoạt tài khoản thành công" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Failed to activate account for employee {maNv}: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error activating account for employee {maNv}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi kích hoạt tài khoản" });
        }
    }

    /// <summary>
    /// Vô hiệu hóa tài khoản nhân viên
    /// </summary>
    /// <param name="maNv">Mã nhân viên</param>
    /// <returns>Kết quả vô hiệu hóa</returns>
    [HttpPost("{maNv}/deactivate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivateAccount(int maNv)
    {
        try
        {
            var result = await _employeeService.DeactivateAccountAsync(maNv);
            if (!result)
            {
                return NotFound(new { message = "Không tìm thấy tài khoản" });
            }

            return Ok(new { message = "Vô hiệu hóa tài khoản thành công" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Failed to deactivate account for employee {maNv}: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error deactivating account for employee {maNv}: {ex.Message}");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi vô hiệu hóa tài khoản" });
        }
    }
}
