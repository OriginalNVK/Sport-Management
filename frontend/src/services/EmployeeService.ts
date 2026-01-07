import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Interfaces cho DTOs
export interface EmployeeDto {
  maNv: number;
  maCoSo: number;
  tenCoSo?: string;
  hoTen: string;
  ngaySinh?: string;
  gioiTinh?: string;
  cmndCccd?: string;
  sdt?: string;
  email?: string;
  diaChi?: string;
  chucVu?: string;
  luongCoBan?: number;
  ngayTuyen?: string;
  tenDangNhap?: string;
  vaiTro?: string;
  kichHoat?: boolean;
}

export interface CreateEmployeeRequest {
  maCoSo: number;
  hoTen: string;
  ngaySinh?: string;
  gioiTinh?: string;
  cmndCccd?: string;
  sdt?: string;
  email?: string;
  diaChi?: string;
  chucVu: string;
  luongCoBan?: number;
  tenDangNhap: string;
  matKhau: string;
  vaiTro?: string;
}

export interface UpdateEmployeeRequest {
  maCoSo?: number;
  hoTen?: string;
  ngaySinh?: string;
  gioiTinh?: string;
  cmndCccd?: string;
  sdt?: string;
  email?: string;
  diaChi?: string;
  chucVu?: string;
  luongCoBan?: number;
}

class EmployeeService {
  /**
   * Lấy token từ localStorage
   */
  private getToken(): string {
    return localStorage.getItem('token') || '';
  }

  /**
   * Tạo config với Authorization header
   */
  private getConfig() {
    return {
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
    };
  }

  /**
   * Lấy danh sách tất cả nhân viên
   */
  async getAllEmployees(): Promise<EmployeeDto[]> {
    try {
      const response = await axios.get<EmployeeDto[]>(
        `${API_BASE_URL}/employees`,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách nhân viên thất bại');
      }
      throw error;
    }
  }

  /**
   * Lấy thông tin nhân viên theo mã
   * @param maNv Mã nhân viên
   */
  async getEmployeeById(maNv: number): Promise<EmployeeDto> {
    try {
      const response = await axios.get<EmployeeDto>(
        `${API_BASE_URL}/employees/${maNv}`,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lấy thông tin nhân viên thất bại');
      }
      throw error;
    }
  }

  /**
   * Lấy danh sách nhân viên theo cơ sở
   * @param maCoSo Mã cơ sở
   */
  async getEmployeesByFacility(maCoSo: number): Promise<EmployeeDto[]> {
    try {
      const response = await axios.get<EmployeeDto[]>(
        `${API_BASE_URL}/employees/facility/${maCoSo}`,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách nhân viên thất bại');
      }
      throw error;
    }
  }

  /**
   * Tạo mới nhân viên
   * @param request Thông tin nhân viên mới
   */
  async createEmployee(request: CreateEmployeeRequest): Promise<{ message: string; maNv: number }> {
    try {
      const response = await axios.post<{ message: string; maNv: number }>(
        `${API_BASE_URL}/employees`,
        request,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Tạo nhân viên thất bại');
      }
      throw error;
    }
  }

  /**
   * Cập nhật thông tin nhân viên
   * @param maNv Mã nhân viên
   * @param request Thông tin cập nhật
   */
  async updateEmployee(maNv: number, request: UpdateEmployeeRequest): Promise<{ message: string }> {
    try {
      const response = await axios.put<{ message: string }>(
        `${API_BASE_URL}/employees/${maNv}`,
        request,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Cập nhật nhân viên thất bại');
      }
      throw error;
    }
  }

  /**
   * Xóa nhân viên
   * @param maNv Mã nhân viên
   */
  async deleteEmployee(maNv: number): Promise<{ message: string }> {
    try {
      const response = await axios.delete<{ message: string }>(
        `${API_BASE_URL}/employees/${maNv}`,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Xóa nhân viên thất bại');
      }
      throw error;
    }
  }

  /**
   * Kích hoạt tài khoản nhân viên
   * @param maNv Mã nhân viên
   */
  async activateAccount(maNv: number): Promise<{ message: string }> {
    try {
      const response = await axios.post<{ message: string }>(
        `${API_BASE_URL}/employees/${maNv}/activate`,
        {},
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Kích hoạt tài khoản thất bại');
      }
      throw error;
    }
  }

  /**
   * Vô hiệu hóa tài khoản nhân viên
   * @param maNv Mã nhân viên
   */
  async deactivateAccount(maNv: number): Promise<{ message: string }> {
    try {
      const response = await axios.post<{ message: string }>(
        `${API_BASE_URL}/employees/${maNv}/deactivate`,
        {},
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Vô hiệu hóa tài khoản thất bại');
      }
      throw error;
    }
  }
}

export default new EmployeeService();
