using backend.DTOs;

namespace backend.Services;

/// <summary>
/// Interface định nghĩa các phương thức cho Employee Service
/// </summary>
public interface IEmployeeService
{
    Task<List<EmployeeDto>> GetAllEmployeesAsync();
    Task<EmployeeDto?> GetEmployeeByIdAsync(int maNv);
    Task<List<EmployeeDto>> GetEmployeesByCoSoAsync(int maCoSo);
    Task<int> CreateEmployeeAsync(CreateEmployeeRequest request);
    Task<bool> UpdateEmployeeAsync(int maNv, UpdateEmployeeRequest request);
    Task<bool> DeleteEmployeeAsync(int maNv);
    Task<bool> ActivateAccountAsync(int maNv);
    Task<bool> DeactivateAccountAsync(int maNv);
}
