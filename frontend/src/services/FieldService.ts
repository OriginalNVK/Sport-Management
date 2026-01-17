import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface FieldDto {
  maSan: number;
  tenSan?: string;
  tinhTrang?: string;
  maLoai?: number;
  tenLoai?: string;
  maCoSo?: number;
  tenCoSo?: string;
  sucChua?: number;
}

export interface UpdateFieldStatusRequest {
  tinhTrang: string;
}

class FieldService {
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
   * Lấy danh sách tất cả sân
   */
  async getAllFields(): Promise<FieldDto[]> {
    try {
      const response = await axios.get<{ success: boolean; data: FieldDto[] }>(
        `${API_BASE_URL}/sans`,
        this.getConfig()
      );
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách sân thất bại');
      }
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái sân
   * @param maSan Mã sân
   * @param request Trạng thái mới
   */
  async updateFieldStatus(maSan: number, request: UpdateFieldStatusRequest): Promise<{ message: string }> {
    try {
      const response = await axios.put<{ message: string }>(
        `${API_BASE_URL}/sans/${maSan}/status`,
        request,
        this.getConfig()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Cập nhật trạng thái sân thất bại');
      }
      throw error;
    }
  }
}

export default new FieldService();
