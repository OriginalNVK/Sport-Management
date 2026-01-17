# Hướng dẫn đổi mode Demo Phantom Read trong Backend

## Cách đổi mode

Khi muốn demo, bạn chỉ cần thay đổi endpoint/logic trong backend, không cần động đến frontend.

---

## 📍 Nơi thay đổi

### File: `backend/Services/LeaveService.cs`

#### 1. **Quản lý đọc danh sách** - Method `GetAllLeaveRequestsAsync()`

**Vị trí**: Line ~21

**Mặc định (Normal mode):**
```csharp
public async Task<List<LeaveRequestDto>> GetAllLeaveRequestsAsync()
{
    try
    {
        var leaveRequests = await _context.DonNghiPheps
            .Include(d => d.MaNvNavigation)
            .ToListAsync();

        return leaveRequests
            .OrderByDescending(d => d.NgayNghi)
            .Select(d => new LeaveRequestDto { ... })
            .ToList();
    }
    catch (Exception ex)
    {
        _logger.LogError($"Error getting all leave requests: {ex.Message}");
        throw;
    }
}
```

**Demo Phantom Read (CÓ LỖI):**
```csharp
public async Task<List<LeaveRequestDto>> GetAllLeaveRequestsAsync()
{
    try
    {
        // Lần đọc đầu tiên
        var leaveRequests1 = await _context.DonNghiPheps
            .Include(d => d.MaNvNavigation)
            .ToListAsync();
        
        _logger.LogInformation($"Lần đọc 1: {leaveRequests1.Count} đơn");
        
        // Delay 5 giây để nhân viên có thời gian insert
        await Task.Delay(5000);
        
        // Lần đọc thứ 2 - sẽ thấy phantom read
        var leaveRequests2 = await _context.DonNghiPheps
            .Include(d => d.MaNvNavigation)
            .ToListAsync();
            
        _logger.LogInformation($"Lần đọc 2: {leaveRequests2.Count} đơn");
        
        if (leaveRequests2.Count > leaveRequests1.Count)
        {
            _logger.LogWarning($"⚠️ PHANTOM READ: Có {leaveRequests2.Count - leaveRequests1.Count} đơn mới!");
        }

        return leaveRequests2
            .OrderByDescending(d => d.NgayNghi)
            .Select(d => new LeaveRequestDto { ... })
            .ToList();
    }
    catch (Exception ex)
    {
        _logger.LogError($"Error getting all leave requests: {ex.Message}");
        throw;
    }
}
```

**Demo ĐÃ FIX (Dùng Stored Procedure):**
```csharp
public async Task<List<LeaveRequestDto>> GetAllLeaveRequestsAsync()
{
    try
    {
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                // Dùng stored procedure đã fix
                command.CommandText = "sp_GetLeaveRequests_FixedPhantomRead";
                command.CommandType = System.Data.CommandType.StoredProcedure;
                command.CommandTimeout = 30;

                var result = new List<LeaveRequestDto>();
                using (var reader = await command.ExecuteReaderAsync())
                {
                    // Đọc lần 1
                    while (await reader.ReadAsync())
                    {
                        result.Add(new LeaveRequestDto { ... });
                    }
                    
                    // Skip lần 2, chỉ trả về lần 1
                }
                
                return result;
            }
        }
    }
    catch (Exception ex)
    {
        _logger.LogError($"Error getting all leave requests: {ex.Message}");
        throw;
    }
}
```

---

#### 2. **Nhân viên tạo đơn** - Method `CreateLeaveRequestAsync()`

**Vị trí**: Line ~142

**Mặc định (Normal mode):**
```csharp
public async Task<int> CreateLeaveRequestAsync(CreateLeaveRequest request)
{
    try
    {
        // Kiểm tra nhân viên có tồn tại không
        var employee = await _context.NhanViens.FindAsync(request.MaNv);
        if (employee == null)
        {
            throw new InvalidOperationException("Nhân viên không tồn tại");
        }

        var leaveRequest = new DonNghiPhep
        {
            MaNv = request.MaNv,
            NgayNghi = DateOnly.FromDateTime(request.NgayNghi),
            LyDo = request.LyDo,
            TrangThai = "cho_duyet"
        };

        _context.DonNghiPheps.Add(leaveRequest);
        await _context.SaveChangesAsync();

        return leaveRequest.MaDon;
    }
    catch (Exception ex)
    {
        _logger.LogError($"Error creating leave request: {ex.Message}");
        throw;
    }
}
```

**Demo GỬI NGAY (Gây phantom read):**
Giữ nguyên code trên - insert ngay lập tức không chờ lock

**Demo BỊ BLOCK (Dùng Stored Procedure):**
```csharp
public async Task<int> CreateLeaveRequestAsync(CreateLeaveRequest request)
{
    try
    {
        using (var connection = _context.Database.GetDbConnection())
        {
            await connection.OpenAsync();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "sp_CreateLeaveRequest_WillBeBlocked";
                command.CommandType = System.Data.CommandType.StoredProcedure;
                command.CommandTimeout = 30; // Cho phép chờ đến 30 giây

                var paramMaNv = command.CreateParameter();
                paramMaNv.ParameterName = "@MaNv";
                paramMaNv.Value = request.MaNv;
                command.Parameters.Add(paramMaNv);

                var paramNgayNghi = command.CreateParameter();
                paramNgayNghi.ParameterName = "@NgayNghi";
                paramNgayNghi.Value = request.NgayNghi.Date;
                command.Parameters.Add(paramNgayNghi);

                var paramLyDo = command.CreateParameter();
                paramLyDo.ParameterName = "@LyDo";
                paramLyDo.Value = request.LyDo;
                command.Parameters.Add(paramLyDo);

                var paramOutput = command.CreateParameter();
                paramOutput.ParameterName = "@MaDonOutput";
                paramOutput.Direction = System.Data.ParameterDirection.Output;
                paramOutput.DbType = System.Data.DbType.Int32;
                command.Parameters.Add(paramOutput);

                await command.ExecuteNonQueryAsync();

                return (int)paramOutput.Value;
            }
        }
    }
    catch (Exception ex)
    {
        _logger.LogError($"Error creating leave request: {ex.Message}");
        throw;
    }
}
```

---

## 🎯 Tóm tắt các mode

| Mode | Quản lý (GetAll) | Nhân viên (Create) | Kết quả |
|------|------------------|-------------------|---------|
| **Normal** | Đọc bình thường | Insert bình thường | Không demo |
| **Demo có lỗi** | Đọc 2 lần + delay 5s | Insert ngay | ⚠️ Phantom Read |
| **Demo đã fix** | Dùng SP `sp_GetLeaveRequests_FixedPhantomRead` | Dùng SP `sp_CreateLeaveRequest_WillBeBlocked` | ✅ Bị block, không phantom |

---

## 📝 Cách demo

### **Demo Phantom Read (CÓ LỖI):**

1. Sửa `GetAllLeaveRequestsAsync()` → Đọc 2 lần + delay 5s
2. Giữ nguyên `CreateLeaveRequestAsync()` → Insert ngay
3. Quản lý click "Làm mới" → Trong 5s, nhân viên tạo đơn
4. Kết quả: Phantom read xảy ra

### **Demo ĐÃ FIX:**

1. Sửa `GetAllLeaveRequestsAsync()` → Dùng SP `sp_GetLeaveRequests_FixedPhantomRead`
2. Sửa `CreateLeaveRequestAsync()` → Dùng SP `sp_CreateLeaveRequest_WillBeBlocked`
3. Quản lý click "Làm mới" → Trong 5s, nhân viên tạo đơn
4. Kết quả: Nhân viên bị chờ ~5s, không có phantom read

---

## ⚡ Shortcut: Sử dụng API riêng cho demo

**HOẶC** bạn có thể tạo 2 API riêng:

### File: `backend/Controllers/LeaveRequestController.cs`

```csharp
// API hiện tại - Normal mode
[HttpGet]
public async Task<IActionResult> GetAllLeaveRequests()
{
    var leaveRequests = await _leaveService.GetAllLeaveRequestsAsync();
    return Ok(leaveRequests);
}

// API cho demo phantom read (CÓ LỖI)
[HttpGet("demo-phantom")]
public async Task<IActionResult> GetAllLeaveRequestsPhantomDemo()
{
    var result = await _leaveService.GetLeaveRequestsWithPhantomReadAsync();
    return Ok(result);
}

// API cho demo đã fix
[HttpGet("demo-fixed")]
public async Task<IActionResult> GetAllLeaveRequestsFixedDemo()
{
    var result = await _leaveService.GetLeaveRequestsFixedPhantomReadAsync();
    return Ok(result);
}
```

Sau đó trong frontend `LeaveService.ts`, đổi endpoint:

```typescript
// Normal
const response = await axios.get(`${API_BASE_URL}/leave-requests`);

// Demo có lỗi
const response = await axios.get(`${API_BASE_URL}/leave-requests/demo-phantom`);

// Demo đã fix
const response = await axios.get(`${API_BASE_URL}/leave-requests/demo-fixed`);
```

---

## 🚀 Khuyến nghị

**Cách dễ nhất**: Tạo riêng 2 API endpoints cho demo, giữ nguyên API chính. Khi muốn demo, chỉ cần đổi endpoint trong frontend service là xong!

Nếu không muốn động frontend, thì thay đổi trực tiếp logic trong Service như hướng dẫn ở trên.
