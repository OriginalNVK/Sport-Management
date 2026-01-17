# HƯỚNG DẪN DEMO PHANTOM READ

## Tổng quan
Demo này minh họa lỗi **Phantom Read** trong cơ sở dữ liệu và cách khắc phục bằng **SERIALIZABLE isolation level**.

### Phantom Read là gì?
**Phantom Read** xảy ra khi:
1. Transaction A đọc một tập dữ liệu thỏa mãn điều kiện nào đó
2. Transaction B insert/delete dữ liệu mới vào tập dữ liệu đó
3. Transaction A đọc lại và thấy dữ liệu mới xuất hiện (phantom rows)

---

## Các bước chuẩn bị

### 1. Chạy Stored Procedures
Mở SQL Server Management Studio và chạy file:
```sql
database/phantom_read_demo.sql
```

Các stored procedures được tạo:
- ✅ `sp_GetLeaveRequests_WithPhantomRead` - Đọc danh sách (CÓ LỖI)
- ✅ `sp_CreateLeaveRequest_Normal` - Tạo đơn (không bị block)
- ✅ `sp_GetLeaveRequests_FixedPhantomRead` - Đọc danh sách (ĐÃ FIX)
- ✅ `sp_CreateLeaveRequest_WillBeBlocked` - Tạo đơn (sẽ bị block)
- ✅ `sp_ViewCurrentLocks` - Xem locks hiện tại

### 2. Khởi động Backend
```powershell
cd backend
dotnet run
```

### 3. Khởi động Frontend (nếu cần)
```powershell
cd frontend
npm run dev
```

---

## DEMO 1: PHANTOM READ (CÓ LỖI)

### Mục đích
Demo lỗi phantom read khi quản lý đang đọc danh sách đơn nghỉ phép, nhân viên thêm đơn mới và quản lý thấy đơn mới xuất hiện.

### Các bước thực hiện

#### Tab 1: QUẢN LÝ (đọc danh sách)
1. Mở trình duyệt, tab mới hoặc Postman
2. Gọi API:
```http
GET http://localhost:5000/api/v1/leave-requests/phantom-demo
```

**Kết quả mong đợi:**
- API sẽ chạy ~5 giây
- Trả về 2 lần đọc: `LanDoc1` và `LanDoc2`
- Nếu có phantom read: `LanDoc2.length > LanDoc1.length`
- Field `HasPhantomRead: true`

#### Tab 2: NHÂN VIÊN (thêm đơn mới)
**Trong vòng 5 giây** sau khi gọi API ở Tab 1, ngay lập tức gọi:
```http
POST http://localhost:5000/api/v1/leave-requests/normal
Content-Type: application/json

{
  "maNv": 1,
  "ngayNghi": "2026-01-25",
  "lyDo": "Nghỉ ốm - DEMO PHANTOM READ"
}
```

**Kết quả mong đợi:**
- Insert thành công ngay lập tức
- Không bị chờ

### Kết quả Demo 1
Quay lại Tab 1 (Quản lý):
```json
{
  "lanDoc1": [
    // Ví dụ: 3 đơn
  ],
  "lanDoc2": [
    // Ví dụ: 4 đơn (có thêm đơn mới từ nhân viên)
  ],
  "hasPhantomRead": true,
  "message": "⚠️ PHANTOM READ DETECTED: Lần 1 có 3 đơn, lần 2 có 4 đơn"
}
```

✅ **THÀNH CÔNG:** Đã demo được lỗi Phantom Read!

---

## DEMO 2: ĐÃ FIX PHANTOM READ

### Mục đích
Demo đã khắc phục phantom read bằng SERIALIZABLE isolation level. Khi quản lý đang đọc, nhân viên thêm đơn sẽ bị chờ (blocked).

### Các bước thực hiện

#### Tab 1: QUẢN LÝ (đọc danh sách với SERIALIZABLE)
1. Gọi API:
```http
GET http://localhost:5000/api/v1/leave-requests/fixed-phantom-demo
```

**Kết quả mong đợi:**
- API sẽ chạy ~5 giây
- Sử dụng SERIALIZABLE lock
- Giữ lock trong suốt quá trình đọc

#### Tab 2: NHÂN VIÊN (thêm đơn mới - sẽ bị block)
**Trong vòng 5 giây** sau khi gọi API ở Tab 1, ngay lập tức gọi:
```http
POST http://localhost:5000/api/v1/leave-requests/will-block
Content-Type: application/json

{
  "maNv": 1,
  "ngayNghi": "2026-01-26",
  "lyDo": "Nghỉ phép - DEMO FIX PHANTOM READ"
}
```

**Kết quả mong đợi:**
- API này sẽ **BỊ CHỜ** (blocked)
- Không thể insert ngay
- Phải đợi Tab 1 đọc xong (~5 giây)

### Kết quả Demo 2

**Tab 1 (Quản lý) - kết thúc trước:**
```json
{
  "lanDoc1": [
    // Ví dụ: 3 đơn
  ],
  "lanDoc2": [
    // Vẫn 3 đơn (KHÔNG có đơn mới)
  ],
  "hasPhantomRead": false,
  "message": "✓ ĐÃ FIX: Lần 1 có 3 đơn, lần 2 có 3 đơn (không thay đổi)"
}
```

**Tab 2 (Nhân viên) - kết thúc sau ~5 giây:**
```json
{
  "message": "Tạo đơn nghỉ phép thành công (đã chờ 5.12 giây do transaction khác đang lock)",
  "maDon": 123,
  "waitedSeconds": 5.12
}
```

✅ **THÀNH CÔNG:** Đã fix phantom read! Nhân viên bị chờ cho đến khi quản lý đọc xong.

---

## So sánh kết quả

| Tiêu chí | Demo 1 (CÓ LỖI) | Demo 2 (ĐÃ FIX) |
|----------|-----------------|-----------------|
| **Isolation Level** | READ COMMITTED (mặc định) | SERIALIZABLE |
| **Lock Type** | Shared lock (chỉ lock rows đã đọc) | Range lock (lock toàn bộ range) |
| **Insert behavior** | Insert ngay lập tức | Bị chờ (blocked) |
| **Phantom Read** | ✗ CÓ (lần đọc 2 thấy dữ liệu mới) | ✓ KHÔNG (lần đọc 2 giống lần 1) |
| **Consistency** | ✗ Không nhất quán | ✓ Nhất quán |

---

## Kiểm tra Locks (Optional)

Trong khi Demo 2 đang chạy, mở SQL Server Management Studio và chạy:

```sql
EXEC sp_ViewCurrentLocks;
```

Hoặc:

```sql
SELECT 
    session_id,
    resource_type,
    resource_description,
    request_mode,
    request_status
FROM sys.dm_tran_locks
WHERE resource_database_id = DB_ID('YourDatabaseName');
```

Bạn sẽ thấy:
- Session của quản lý: holding **RangeS-S** hoặc **Serializable** locks
- Session của nhân viên: **WAITING** for locks

---

## API Endpoints Summary

### Demo APIs
| Method | Endpoint | Mô tả | Dùng cho |
|--------|----------|-------|----------|
| GET | `/api/v1/leave-requests/phantom-demo` | Đọc 2 lần với delay 5s (CÓ LỖI) | Demo 1 - Quản lý |
| POST | `/api/v1/leave-requests/normal` | Tạo đơn normal (không block) | Demo 1 - Nhân viên |
| GET | `/api/v1/leave-requests/fixed-phantom-demo` | Đọc 2 lần với SERIALIZABLE (ĐÃ FIX) | Demo 2 - Quản lý |
| POST | `/api/v1/leave-requests/will-block` | Tạo đơn (sẽ bị block) | Demo 2 - Nhân viên |

### Normal APIs (không phải demo)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/leave-requests` | Lấy tất cả đơn |
| GET | `/api/v1/leave-requests/{id}` | Lấy đơn theo ID |
| POST | `/api/v1/leave-requests` | Tạo đơn mới (API bình thường) |
| PUT | `/api/v1/leave-requests/{id}/approve` | Duyệt/từ chối đơn |
| DELETE | `/api/v1/leave-requests/{id}` | Xóa đơn |

---

## Troubleshooting

### Lỗi: Không thấy phantom read trong Demo 1
- **Nguyên nhân:** Nhân viên insert sau khi quản lý đã đọc xong
- **Giải pháp:** Phải insert **trong vòng 5 giây** đầu tiên

### Lỗi: Nhân viên không bị block trong Demo 2
- **Nguyên nhân:** 
  - Stored procedure chưa được tạo đúng
  - Quản lý chưa bắt đầu đọc
- **Giải pháp:** 
  - Kiểm tra stored procedure `sp_GetLeaveRequests_FixedPhantomRead`
  - Đảm bảo gọi API nhân viên **trong vòng 5 giây** sau khi quản lý bắt đầu

### Lỗi: Timeout sau 30 giây
- **Nguyên nhân:** Lock timeout
- **Giải pháp:** Đây là bình thường nếu lock không được release. Kiểm tra transaction của quản lý đã commit chưa.

---

## Giải thích kỹ thuật

### SERIALIZABLE Isolation Level
- **Mục đích:** Ngăn chặn phantom read
- **Cách hoạt động:** 
  - Lock không chỉ các rows đã đọc
  - Mà còn lock **toàn bộ range** thỏa mãn điều kiện WHERE
  - Ngăn các transaction khác INSERT vào range đó
- **Trade-off:** 
  - ✓ Consistency cao
  - ✗ Concurrency thấp hơn
  - ✗ Có thể gây deadlock

### HOLDLOCK hint
```sql
SELECT * FROM DonNghiPhep WITH (HOLDLOCK, SERIALIZABLE)
WHERE TrangThai = 'cho_duyet'
```
- `HOLDLOCK`: Giữ shared lock cho đến khi transaction kết thúc
- `SERIALIZABLE`: Lock range, không chỉ rows

---

## Tham khảo thêm

- [SQL Server Isolation Levels](https://docs.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql)
- [Understanding Phantom Reads](https://docs.microsoft.com/en-us/sql/odbc/reference/develop-app/transaction-isolation-levels)
- [Locking in SQL Server](https://docs.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide)

---

## Kết luận

Sau khi hoàn thành demo, bạn đã:
1. ✅ Hiểu rõ phantom read là gì và cách nó xảy ra
2. ✅ Biết cách reproduce phantom read trong môi trường thực tế
3. ✅ Biết cách khắc phục bằng SERIALIZABLE isolation level
4. ✅ Hiểu trade-off giữa consistency và concurrency

**Lưu ý quan trọng:** Trong production, cân nhắc kỹ khi sử dụng SERIALIZABLE vì có thể ảnh hưởng đến performance. Chỉ sử dụng khi thực sự cần consistency cao.
