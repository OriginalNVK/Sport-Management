import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Interfaces cho DTOs
export interface LoginRequest {
  tenDangNhap: string;
  matKhau: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expireIn: number;
  vaiTro: string;
  maKh?: number;
  maNv?: number;
}

export interface RegisterCustomerRequest {
  tenDangNhap: string;
  matKhau: string;
  hoTen: string;
  ngaySinh?: string;
  gioiTinh?: string;
  cmndCccd?: string;
  sdt: string;
  email: string;
  diaChi?: string;
}

export interface RegisterEmployeeRequest extends RegisterCustomerRequest {
  maCoSo: number;
  chucVu: string;
  luongCoBan: number;
}

class AuthService {
  /**
   * Đăng nhập
   * @param request Thông tin đăng nhập
   * @returns Token và thông tin người dùng
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/login`,
        request
      );
      
      // Lưu token vào localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('vaiTro', response.data.vaiTro);
        if (response.data.maKh) {
          localStorage.setItem('maKh', response.data.maKh.toString());
        }
        if (response.data.maNv) {
          localStorage.setItem('maNv', response.data.maNv.toString());
        }
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
      }
      throw error;
    }
  }

  /**
   * Đăng ký tài khoản khách hàng
   * @param request Thông tin đăng ký
   * @returns Token và thông tin người dùng
   */
  async registerCustomer(request: RegisterCustomerRequest): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/register/customer`,
        request
      );
      
      // Lưu token vào localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('vaiTro', response.data.vaiTro);
        if (response.data.maKh) {
          localStorage.setItem('maKh', response.data.maKh.toString());
        }
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Đăng ký thất bại');
      }
      throw error;
    }
  }

  /**
   * Đăng ký tài khoản nhân viên (chỉ admin/manager)
   * @param request Thông tin đăng ký nhân viên
   * @returns Token và thông tin người dùng
   */
  async registerEmployee(request: RegisterEmployeeRequest): Promise<LoginResponse> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/register/employee`,
        request,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Đăng ký nhân viên thất bại');
      }
      throw error;
    }
  }

  /**
   * Đăng xuất
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('vaiTro');
    localStorage.removeItem('maKh');
    localStorage.removeItem('maNv');
  }

  /**
   * Kiểm tra đã đăng nhập chưa
   * @returns true nếu đã đăng nhập
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Lấy token hiện tại
   * @returns Token hoặc null
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Lấy vai trò người dùng
   * @returns Vai trò hoặc null
   */
  getUserRole(): string | null {
    return localStorage.getItem('vaiTro');
  }

  /**
   * Lấy mã khách hàng
   * @returns Mã khách hàng hoặc null
   */
  getCustomerId(): number | null {
    const maKh = localStorage.getItem('maKh');
    return maKh ? parseInt(maKh) : null;
  }

  /**
   * Lấy mã nhân viên
   * @returns Mã nhân viên hoặc null
   */
  getEmployeeId(): number | null {
    const maNv = localStorage.getItem('maNv');
    return maNv ? parseInt(maNv) : null;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
