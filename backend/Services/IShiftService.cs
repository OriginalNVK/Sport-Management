using backend.DTOs;

namespace backend.Services;

/// <summary>
/// Interface định nghĩa các phương thức cho Shift Service
/// </summary>
public interface IShiftService
{
    Task<List<ShiftDto>> GetAllShiftsAsync();
    Task<ShiftDto?> GetShiftByIdAsync(int maCa);
    Task<List<ShiftDto>> GetShiftsByCoSoAsync(int maCoSo);
    Task<List<ShiftDto>> GetShiftsByDateAsync(DateTime date);
    Task<int> CreateShiftAsync(CreateShiftRequest request);
    Task<bool> UpdateShiftAsync(int maCa, UpdateShiftRequest request);
    Task<bool> DeleteShiftAsync(int maCa);
    
    Task<List<ShiftAssignmentDto>> GetAllShiftAssignmentsAsync();
    Task<List<ShiftAssignmentDto>> GetShiftAssignmentsByEmployeeAsync(int maNv);
    Task<List<ShiftAssignmentDto>> GetShiftAssignmentsByShiftAsync(int maCa);
    Task<int> AssignShiftAsync(AssignShiftRequest request);
    Task<bool> RemoveShiftAssignmentAsync(int maPc);
}
