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

export interface PhantomReadDemoResult {
  lanDoc1: LeaveRequestDto[];
  lanDoc2: LeaveRequestDto[];
  message: string;
  startTime: string;
  endTime: string;
  hasPhantomRead: boolean;
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


  async getAllLeaveRequests(): Promise<LeaveRequestDto[]> {
    try {
      // ========== MODE 1: NORMAL ==========
      const response = await axios.get<PhantomReadDemoResult>(
        `${API_BASE_URL}/leave-requests/phantom-demo`,
        this.getConfig()
      );
      return response.data.lanDoc2 || [];
      
      // ========== MODE 2: DEMO FIXED ==========
      // Quản lý dùng SERIALIZABLE lock. Khi quản lý đang đọc danh sách, nhân viên gửi đơn mới sẽ bị block

      // const response = await axios.get<PhantomReadDemoResult>(
      //   `${API_BASE_URL}/leave-requests/fixed-phantom-demo`,
      //   this.getConfig()
      // );
      // console.log('Fixed Phantom Read Demo Response:', response.data);
      // console.log('lanDoc2:', response.data.lanDoc2);
      // return response.data.lanDoc2 || [];

    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách đơn nghỉ phép thất bại');
      }
      throw error;
    }
  }


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


  async createLeaveRequest(request: CreateLeaveRequest): Promise<{ message: string; maDon: number }> {
    try {

      const response = await axios.post<{ message: string; maDon: number }>(
        `${API_BASE_URL}/leave-requests/will-block`,
        request,
        this.getConfig()
      );
      console.log(' Nhân viên gửi đơn thành công!');
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

  // =============================================
  // PHANTOM READ DEMO METHODS
  // =============================================

  /**
   * [DEMO] Đọc danh sách đơn nghỉ phép 2 lần (CÓ LỖI PHANTOM READ)
   */
  async getLeaveRequestsWithPhantomRead(): Promise<PhantomReadDemoResult> {
    try {
      const response = await axios.get<PhantomReadDemoResult>(
        `${API_BASE_URL}/leave-requests/phantom-demo`,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Demo phantom read thất bại');
      }
      throw error;
    }
  }

  /**
   * [DEMO] Đọc danh sách đơn nghỉ phép 2 lần (ĐÃ FIX PHANTOM READ)
   */
  async getLeaveRequestsFixedPhantomRead(): Promise<PhantomReadDemoResult> {
    try {
      const response = await axios.get<PhantomReadDemoResult>(
        `${API_BASE_URL}/leave-requests/fixed-phantom-demo`,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Demo fixed phantom read thất bại');
      }
      throw error;
    }
  }

  /**
   * [DEMO] Tạo đơn nghỉ phép (NORMAL - không bị block)
   */
  async createLeaveRequestNormal(request: CreateLeaveRequest): Promise<{ message: string; maDon: number }> {
    try {
      const response = await axios.post<{ message: string; maDon: number }>(
        `${API_BASE_URL}/leave-requests/normal`,
        request,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Tạo đơn nghỉ phép (normal) thất bại');
      }
      throw error;
    }
  }

  /**
   * [DEMO] Tạo đơn nghỉ phép (SẼ BỊ BLOCK nếu có transaction đang lock)
   */
  async createLeaveRequestWillBlock(request: CreateLeaveRequest): Promise<{ message: string; maDon: number; waitedSeconds?: number }> {
    try {
      const response = await axios.post<{ message: string; maDon: number; waitedSeconds?: number }>(
        `${API_BASE_URL}/leave-requests/will-block`,
        request,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Tạo đơn nghỉ phép (will block) thất bại');
      }
      throw error;
    }
  }
}

export default new LeaveService();
