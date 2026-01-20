namespace backend.DTOs;

public class UpdateInvoiceRequest
{
    public string? MaGiamGia { get; set; }
    public bool TestRollback { get; set; } = false;  // Demo rollback for dirty read testing
}
