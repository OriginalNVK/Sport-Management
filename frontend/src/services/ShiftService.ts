import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Interfaces cho DTOs
export interface ShiftDto {
  maCa: number;
  maCoSo: number;
  tenCoSo?: string;
  ngay: string;
  gioBatDau: string;
  gioKetThuc: string;
  tenCa?: string;
}

export interface CreateShiftRequest {
  maCoSo: number;
  ngay: string;
  gioBatDau: string;
  gioKetThuc: string;
  tenCa: string;
}

export interface UpdateShiftRequest {
  ngay?: string;
  gioBatDau?: string;
  gioKetThuc?: string;
  tenCa?: string;
}

export interface ShiftAssignmentDto {
  maPc: number;
  maNv: number;
  tenNhanVien?: string;
  chucVu?: string;
  maCa: number;
  tenCa?: string;
  ngay?: string;
  gioBatDau?: string;
  gioKetThuc?: string;
}

export interface AssignShiftRequest {
  maNv: number;
  maCa: number;
}

class ShiftService {
  /**
   * Lấy token từ localStorage
   */
  private getToken(): string {
    return localStorage.getItem('access_token') || '';
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

  // ========== Shift Management ==========

  /**
   * Lấy danh sách tất cả ca trực
   */
  async getAllShifts(): Promise<ShiftDto[]> {
    try {
      const response = await axios.get<ShiftDto[]>(
        `${API_BASE_URL}/shifts`,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách ca trực thất bại');
      }
      throw error;
    }
  }

  /**
   * Lấy thông tin ca trực theo mã
   * @param maCa Mã ca trực
   */
  async getShiftById(maCa: number): Promise<ShiftDto> {
    try {
      const response = await axios.get<ShiftDto>(
        `${API_BASE_URL}/shifts/${maCa}`,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lấy thông tin ca trực thất bại');
      }
      throw error;
    }
  }

  /**
   * Lấy danh sách ca trực theo cơ sở
   * @param maCoSo Mã cơ sở
   */
  async getShiftsByFacility(maCoSo: number): Promise<ShiftDto[]> {
    try {
      const response = await axios.get<ShiftDto[]>(
        `${API_BASE_URL}/shifts/facility/${maCoSo}`,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách ca trực thất bại');
      }
      throw error;
    }
  }

  /**
   * Lấy danh sách ca trực theo ngày
   * @param date Ngày (YYYY-MM-DD)
   */
  async getShiftsByDate(date: string): Promise<ShiftDto[]> {
    try {
      const response = await axios.get<ShiftDto[]>(
        `${API_BASE_URL}/shifts/date/${date}`,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách ca trực thất bại');
      }
      throw error;
    }
  }

  /**
   * Tạo mới ca trực
   * @param request Thông tin ca trực mới
   */
  async createShift(request: CreateShiftRequest): Promise<{ message: string; maCa: number }> {
    try {
      const response = await axios.post<{ message: string; maCa: number }>(
        `${API_BASE_URL}/shifts`,
        request,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Tạo ca trực thất bại');
      }
      throw error;
    }
  }

  /**
   * Cập nhật thông tin ca trực
   * @param maCa Mã ca trực
   * @param request Thông tin cập nhật
   */
  async updateShift(maCa: number, request: UpdateShiftRequest): Promise<{ message: string }> {
    try {
      const response = await axios.put<{ message: string }>(
        `${API_BASE_URL}/shifts/${maCa}`,
        request,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Cập nhật ca trực thất bại');
      }
      throw error;
    }
  }

  /**
   * Xóa ca trực
   * @param maCa Mã ca trực
   */
  async deleteShift(maCa: number): Promise<{ message: string }> {
    try {
      const response = await axios.delete<{ message: string }>(
        `${API_BASE_URL}/shifts/${maCa}`,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Xóa ca trực thất bại');
      }
      throw error;
    }
  }

  // ========== Shift Assignment ==========

  /**
   * Lấy danh sách tất cả phân công ca
   */
  async getAllShiftAssignments(): Promise<ShiftAssignmentDto[]> {
    try {
      const response = await axios.get<ShiftAssignmentDto[]>(
        `${API_BASE_URL}/shifts/assignments`,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách phân công ca thất bại');
      }
      throw error;
    }
  }

  /**
   * Lấy danh sách phân công ca theo nhân viên
   * @param maNv Mã nhân viên
   */
  async getShiftAssignmentsByEmployee(maNv: number): Promise<ShiftAssignmentDto[]> {
    try {
      const response = await axios.get<ShiftAssignmentDto[]>(
        `${API_BASE_URL}/shifts/assignments/employee/${maNv}`,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách phân công ca thất bại');
      }
      throw error;
    }
  }

  /**
   * Lấy danh sách phân công ca theo ca trực
   * @param maCa Mã ca trực
   */
  async getShiftAssignmentsByShift(maCa: number): Promise<ShiftAssignmentDto[]> {
    try {
      const response = await axios.get<ShiftAssignmentDto[]>(
        `${API_BASE_URL}/shifts/assignments/shift/${maCa}`,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách phân công ca thất bại');
      }
      throw error;
    }
  }

  /**
   * Phân công ca trực cho nhân viên
   * @param request Thông tin phân công ca
   */
  async assignShift(request: AssignShiftRequest): Promise<{ message: string; maPc: number }> {
    try {
      const response = await axios.post<{ message: string; maPc: number }>(
        `${API_BASE_URL}/shifts/assignments`,
        request,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Phân công ca thất bại');
      }
      throw error;
    }
  }

  /**
   * Xóa phân công ca
   * @param maPc Mã phân công
   */
  async removeShiftAssignment(maPc: number): Promise<{ message: string }> {
    try {
      const response = await axios.delete<{ message: string }>(
        `${API_BASE_URL}/shifts/assignments/${maPc}`,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Xóa phân công ca thất bại');
      }
      throw error;
    }
  }
}

export default new ShiftService();
