import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Interfaces cho DTOs
export interface LeaveRequestDto {
  maDon: number;
  maNv: number;
  tenNhanVien?: string;
  chucVu?: string;
  ngayNghi: string;
  lyDo?: string;
  trangThai?: string; // cho_duyet, da_duyet, tu_choi
}

export interface CreateLeaveRequest {
  maNv: number;
  ngayNghi: string;
  lyDo: string;
}

export interface ApproveLeaveRequest {
  trangThai: string; // da_duyet hoặc tu_choi
}

class LeaveService {
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

  /**
   * Lấy danh sách tất cả đơn nghỉ phép
   */
  async getAllLeaveRequests(): Promise<LeaveRequestDto[]> {
    try {
      const response = await axios.get<LeaveRequestDto[]>(
        `${API_BASE_URL}/leave-requests`,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách đơn nghỉ phép thất bại');
      }
      throw error;
    }
  }

  /**
   * Lấy thông tin đơn nghỉ phép theo mã
   * @param maDon Mã đơn nghỉ phép
   */
  async getLeaveRequestById(maDon: number): Promise<LeaveRequestDto> {
    try {
      const response = await axios.get<LeaveRequestDto>(
        `${API_BASE_URL}/leave-requests/${maDon}`,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lấy thông tin đơn nghỉ phép thất bại');
      }
      throw error;
    }
  }

  /**
   * Lấy danh sách đơn nghỉ phép theo nhân viên
   * @param maNv Mã nhân viên
   */
  async getLeaveRequestsByEmployee(maNv: number): Promise<LeaveRequestDto[]> {
    try {
      const response = await axios.get<LeaveRequestDto[]>(
        `${API_BASE_URL}/leave-requests/employee/${maNv}`,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách đơn nghỉ phép thất bại');
      }
      throw error;
    }
  }

  /**
   * Lấy danh sách đơn nghỉ phép theo trạng thái
   * @param trangThai Trạng thái (cho_duyet, da_duyet, tu_choi)
   */
  async getLeaveRequestsByStatus(trangThai: string): Promise<LeaveRequestDto[]> {
    try {
      const response = await axios.get<LeaveRequestDto[]>(
        `${API_BASE_URL}/leave-requests/status/${trangThai}`,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách đơn nghỉ phép thất bại');
      }
      throw error;
    }
  }

  /**
   * Tạo mới đơn nghỉ phép
   * @param request Thông tin đơn nghỉ phép mới
   */
  async createLeaveRequest(request: CreateLeaveRequest): Promise<{ message: string; maDon: number }> {
    try {
      const response = await axios.post<{ message: string; maDon: number }>(
        `${API_BASE_URL}/leave-requests`,
        request,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Tạo đơn nghỉ phép thất bại');
      }
      throw error;
    }
  }

  /**
   * Duyệt hoặc từ chối đơn nghỉ phép
   * @param maDon Mã đơn nghỉ phép
   * @param request Trạng thái mới (da_duyet hoặc tu_choi)
   */
  async approveLeaveRequest(maDon: number, request: ApproveLeaveRequest): Promise<{ message: string }> {
    try {
      const response = await axios.put<{ message: string }>(
        `${API_BASE_URL}/leave-requests/${maDon}/approve`,
        request,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Duyệt đơn nghỉ phép thất bại');
      }
      throw error;
    }
  }

  /**
   * Xóa đơn nghỉ phép
   * @param maDon Mã đơn nghỉ phép
   */
  async deleteLeaveRequest(maDon: number): Promise<{ message: string }> {
    try {
      const response = await axios.delete<{ message: string }>(
        `${API_BASE_URL}/leave-requests/${maDon}`,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Xóa đơn nghỉ phép thất bại');
      }
      throw error;
    }
  }
}

export default new LeaveService();
