using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class ReportFilterRequest
{
    public DateOnly FromDate { get; set; }
    public DateOnly ToDate { get; set; }

    // optional filters
    public int? MaCoSo { get; set; }
    public int? MaLoaiSan { get; set; }

    // for utilization calculation
    public TimeOnly OperatingStart { get; set; } = new TimeOnly(6, 0);
    public TimeOnly OperatingEnd { get; set; } = new TimeOnly(23, 0);
}
