using backend.DTOs;

namespace backend.Services;

public interface IDashboardService
{
    Task<ReportSummaryResponse> GetSummaryAsync(ReportFilterRequest filter);
    Task<byte[]> ExportCsvAsync(ReportFilterRequest filter);
}
