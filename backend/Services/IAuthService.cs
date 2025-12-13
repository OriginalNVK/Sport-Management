using backend.DTOs;

namespace backend.Services;

/// <summary>
/// Interface định nghĩa các phương thức cho Authentication Service
/// </summary>
public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    Task<string> RegisterCustomerAsync(RegisterRequest request);
    Task<string> RegisterEmployeeAsync(RegisterEmployeeRequest request);
}
