using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
[Authorize(Roles = "quan_ly,admin")]
[AllowAnonymous]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(IDashboardService dashboardService, ILogger<DashboardController> logger)
    {
        _dashboardService = dashboardService;
        _logger = logger;
    }

    // POST api/v1/dashboard/summary
    [HttpPost("summary")]
    [ProducesResponseType(typeof(ReportSummaryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<object>> GetSummary([FromBody] ReportFilterRequest filter)
    {
        try
        {
            var data = await _dashboardService.GetSummaryAsync(filter);
            return Ok(new { success = true, data });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Dashboard summary invalid: {Message}", ex.Message);
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Dashboard summary error");
            return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi khi lấy dữ liệu dashboard" });
        }
    }

    // POST api/v1/dashboard/export/csv
    [HttpPost("export/csv")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ExportCsv([FromBody] ReportFilterRequest filter)
    {
        try
        {
            var bytes = await _dashboardService.ExportCsvAsync(filter);
            var fileName = $"dashboard_{filter.FromDate:yyyyMMdd}_{filter.ToDate:yyyyMMdd}.csv";
            return File(bytes, "text/csv; charset=utf-8", fileName);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Export CSV invalid: {Message}", ex.Message);
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Export CSV error");
            return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi khi export CSV dashboard" });
        }
    }
}
