# Sport Management Backend API

API backend cho hệ thống quản lý sân bóng được xây dựng với .NET 9.0 và SQL Server.

## 📋 Yêu cầu hệ thống

- .NET 9.0 SDK
- SQL Server (Express hoặc cao hơn)
- Visual Studio 2022 hoặc VS Code (khuyến nghị)

## 🚀 Cài đặt và Chạy

### 1. Cài đặt Dependencies

```bash
cd backend
dotnet restore
```

### 2. Cấu hình Database

Cập nhật connection string trong file `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=QuanLySanBong;User Id=YOUR_USERNAME;Password=YOUR_PASSWORD;TrustServerCertificate=True;"
  }
}
```

**Lưu ý:** Thay thế `YOUR_SERVER`, `YOUR_USERNAME`, và `YOUR_PASSWORD` bằng thông tin SQL Server của bạn.

### 3. Tạo Database

Chạy các script SQL trong folder `database/` theo thứ tự:

```sql
-- 1. Tạo schema
database/schema.sql

-- 2. Thêm constraints
database/constraint.sql

-- 3. Import dữ liệu mẫu (nếu có)
database/data.sql
```

### 4. Chạy Application

```bash
cd backend
dotnet run
```

Hoặc sử dụng Visual Studio: nhấn F5 để chạy với debug mode.

Application sẽ chạy tại: `http://localhost:5271`

## 📚 API Documentation

Swagger UI sẽ tự động mở khi chạy application ở Development mode tại: **http://localhost:5271**

### Các Endpoints Chính

#### 🔐 Authentication Endpoints

| Method | Endpoint                    | Mô tả              | Request Body                                       |
| ------ | --------------------------- | ------------------ | -------------------------------------------------- |
| POST   | `/api/v1/login`             | Đăng nhập          | `{ "tenDangNhap": "string", "matKhau": "string" }` |
| POST   | `/api/v1/register/customer` | Đăng ký khách hàng | `RegisterRequest`                                  |
| POST   | `/api/v1/register/employee` | Đăng ký nhân viên  | `RegisterEmployeeRequest`                          |

#### 📝 Chi tiết Request/Response

**1. Login**

```json
// Request
POST /api/v1/login
{
  "tenDangNhap": "user123",
  "matKhau": "password123"
}

// Response (Success)
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "random_base64_string",
  "expireIn": 30,
  "vaiTro": "khach_hang",
  "maKh": 1,
  "maNv": null
}
```

**2. Register Customer**

```json
// Request
POST /api/v1/register/customer
{
  "tenDangNhap": "khachhang1",
  "matKhau": "password123",
  "hoTen": "Nguyễn Văn A",
  "ngaySinh": "1990-01-01",
  "gioiTinh": "Nam",
  "cmndCccd": "123456789",
  "sdt": "0123456789",
  "email": "customer@example.com",
  "diaChi": "123 Đường ABC, TP.HCM"
}

// Response
{
  "message": "Tài khoản đăng ký thành công"
}
```

**3. Register Employee**

```json
// Request
POST /api/v1/register/employee
{
  "tenDangNhap": "nhanvien1",
  "matKhau": "password123",
  "hoTen": "Trần Thị B",
  "ngaySinh": "1995-05-15",
  "gioiTinh": "Nữ",
  "cmndCccd": "987654321",
  "sdt": "0987654321",
  "email": "employee@example.com",
  "diaChi": "456 Đường XYZ, Hà Nội",
  "maCoSo": 1,
  "chucVu": "lt",
  "luongCoBan": 8000000
}

// Response
{
  "message": "Tài khoản nhân viên đăng ký thành công"
}
```

## 🔑 JWT Authentication

### Sử dụng Token trong Swagger UI

1. Đăng nhập qua endpoint `/api/v1/login` để lấy token
2. Click nút **"Authorize"** ở góc trên bên phải Swagger UI
3. Nhập: `Bearer {your_token_here}` (có khoảng trắng sau "Bearer")
4. Click **"Authorize"** và **"Close"**
5. Token sẽ được tự động thêm vào tất cả requests

### Sử dụng Token trong Postman/Thunder Client

Thêm header vào request:

```
Authorization: Bearer {your_token_here}
```

### Token Expiration

- Token hết hạn sau: **30 phút**
- Cần đăng nhập lại để lấy token mới khi hết hạn

## 👥 Vai trò (Roles)

Hệ thống hỗ trợ các vai trò sau:

| Vai trò       | Mô tả                 | Chức vụ          |
| ------------- | --------------------- | ---------------- |
| `khach_hang`  | Khách hàng            | -                |
| `quan_ly`     | Quản lý               | `ql`             |
| `le_tan`      | Lễ tân                | `lt`             |
| `ky_thuat`    | Kỹ thuật              | `kt`             |
| `thu_ngan`    | Thu ngân              | `tn`             |
| `nhanvien_bt` | Nhân viên bình thường | Các chức vụ khác |

**Lưu ý:** Vai trò được tự động gán dựa trên chức vụ khi đăng ký nhân viên.

## 🗂️ Cấu trúc thư mục

```
backend/
├── Controllers/          # API Controllers
│   └── AuthController.cs
├── Services/            # Business Logic Layer
│   ├── IAuthService.cs
│   └── AuthService.cs
├── Models/              # Database Models
│   ├── TaiKhoan.cs
│   ├── KhachHang.cs
│   └── NhanVien.cs
├── DTOs/                # Data Transfer Objects
│   ├── LoginRequest.cs
│   ├── LoginResponse.cs
│   ├── RegisterRequest.cs
│   └── RegisterEmployeeRequest.cs
├── Helpers/             # Utility Classes
│   └── MD5Helper.cs
├── Properties/          # Launch Settings
├── appsettings.json     # Configuration
├── Program.cs           # Application Entry Point
└── backend.csproj       # Project File
```

## 🔧 Cấu hình JWT

Cấu hình JWT trong `appsettings.json`:

```json
{
  "JwtSettings": {
    "SecretKey": "SportManagement2024SecretKeyForJWTAuthentication!@#$%",
    "Issuer": "SportManagement",
    "Audience": "SportManagementUsers",
    "ExpiryInMinutes": 30
  }
}
```

**Quan trọng:** Trong production, hãy thay đổi `SecretKey` và lưu trong environment variables hoặc Azure Key Vault.

## 🛠️ Công nghệ sử dụng

- **Framework:** ASP.NET Core 9.0
- **ORM:** Dapper (Micro ORM)
- **Database:** Microsoft SQL Server
- **Authentication:** JWT Bearer Token
- **Password Hashing:** MD5 (khuyến nghị nâng cấp lên BCrypt hoặc Argon2 cho production)
- **API Documentation:** Swagger/OpenAPI
- **Dependency Injection:** Built-in .NET DI Container

## 📦 NuGet Packages

```xml
<PackageReference Include="Dapper" Version="2.1.35" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.0.0" />
<PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="9.0.4" />
<PackageReference Include="Microsoft.Data.SqlClient" Version="5.2.2" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="7.2.0" />
```

## 🐛 Debugging

### Build Project

```bash
dotnet build
```

### Xem logs

Logs sẽ hiển thị trong console khi chạy application. Các log bao gồm:

- Thông tin đăng nhập thành công/thất bại
- Đăng ký tài khoản mới
- Lỗi xảy ra trong quá trình xử lý
