using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;
    private readonly ILogger<InvoicesController> _logger;

    public InvoicesController(IInvoiceService invoiceService, ILogger<InvoicesController> logger)
    {
        _invoiceService = invoiceService;
        _logger = logger;
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<object>> CreateInvoice([FromBody] CreateInvoiceRequest request)
    {
        try
        {
            var maHd = await _invoiceService.CreateInvoiceAsync(request);

            _logger.LogInformation("Tạo hóa đơn thành công. Mã hóa đơn: {MaHd}", maHd);

            return Ok(new
            {
                success = true,
                message = "Tạo hóa đơn thành công",
                data = new
                {
                    ma_hd = maHd
                }
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Lỗi tạo hóa đơn: {Message}", ex.Message);
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi không xác định khi tạo hóa đơn");
            return StatusCode(500, new
            {
                success = false,
                message = "Đã xảy ra lỗi khi tạo hóa đơn"
            });
        }
    }

    [HttpGet("{maHd}")]
    [ProducesResponseType(typeof(InvoiceResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InvoiceResponse>> GetInvoiceById(int maHd)
    {
        try
        {
            var invoice = await _invoiceService.GetInvoiceByIdAsync(maHd);

            if (invoice == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = $"Không tìm thấy hóa đơn với mã {maHd}"
                });
            }

            return Ok(new
            {
                success = true,
                data = invoice
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy thông tin hóa đơn {MaHd}", maHd);
            return StatusCode(500, new
            {
                success = false,
                message = "Đã xảy ra lỗi khi lấy thông tin hóa đơn"
            });
        }
    }

    [HttpGet("customer/{maKh}")]
    [ProducesResponseType(typeof(List<InvoiceResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<InvoiceResponse>>> GetInvoicesByCustomer(int maKh)
    {
        try
        {
            var invoices = await _invoiceService.GetInvoicesByCustomerAsync(maKh);

            return Ok(new
            {
                success = true,
                data = invoices,
                count = invoices.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách hóa đơn của khách hàng {MaKh}", maKh);
            return StatusCode(500, new
            {
                success = false,
                message = "Đã xảy ra lỗi khi lấy danh sách hóa đơn"
            });
        }
    }

    [HttpGet("all")]
    [ProducesResponseType(typeof(List<InvoiceResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<InvoiceResponse>>> GetAllInvoices([FromQuery] string? trangThai = null)
    {
        try
        {
            var invoices = await _invoiceService.GetAllInvoicesAsync(trangThai);

            return Ok(new
            {
                success = true,
                data = invoices,
                count = invoices.Count,
                filter = trangThai ?? "all"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách hóa đơn");
            return StatusCode(500, new
            {
                success = false,
                message = "Đã xảy ra lỗi khi lấy danh sách hóa đơn"
            });
        }
    }

    [HttpPost("pay")]
    [ProducesResponseType(typeof(PaymentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PaymentResponse>> PayInvoice([FromBody] PaymentRequest request)
    {
        try
        {
            var payment = await _invoiceService.PayInvoiceAsync(request);

            _logger.LogInformation("Thanh toán thành công. Mã thanh toán: {MaTt}, Mã hóa đơn: {MaHd}",
                payment.MaTt, payment.MaHd);

            return Ok(new
            {
                success = true,
                message = payment.Message,
                data = payment
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Lỗi thanh toán: {Message}", ex.Message);
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi không xác định khi thanh toán");
            return StatusCode(500, new
            {
                success = false,
                message = "Đã xảy ra lỗi khi thanh toán"
            });
        }
    }

    [HttpDelete("{maHd}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> CancelInvoice(int maHd)
    {
        try
        {
            var result = await _invoiceService.CancelInvoiceAsync(maHd);

            if (!result)
            {
                return NotFound(new
                {
                    success = false,
                    message = $"Không tìm thấy hóa đơn với mã {maHd}"
                });
            }

            _logger.LogInformation("Hủy hóa đơn thành công. Mã hóa đơn: {MaHd}", maHd);

            return Ok(new
            {
                success = true,
                message = "Hủy hóa đơn thành công"
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Lỗi hủy hóa đơn: {Message}", ex.Message);
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi không xác định khi hủy hóa đơn {MaHd}", maHd);
            return StatusCode(500, new
            {
                success = false,
                message = "Đã xảy ra lỗi khi hủy hóa đơn"
            });
        }
    }
}
