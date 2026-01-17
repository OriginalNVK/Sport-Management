import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Interfaces cho DTOs
export interface CreateInvoiceRequest {
  maPhieu: number;
  
  // Mã giảm giá duy nhất (VD: "SLV5")
  maGiamGia?: string | null;
  
  phanTramThue?: number;
}

export interface InvoiceResponse {
  maHd: number;
  maPhieu: number;
  ngayLap: string;
  tongTien: number;
  thue: number;
  giamGia: number;
  tongCuoi: number;
  tinhTrangTt?: string;
  tenKhachHang?: string;
  tenSan?: string;
  ngayDat?: string;
  gioBatDau?: string;
  gioKetThuc?: string;
}

export interface InvoiceDetailResponse {
  maHd: number;
  maPhieu: number;
  ngayLap: string;
  tongTien: number;
  thue: number;
  giamGia: number;
  tongCuoi: number;
  tinhTrangTt?: string;
  tenKhachHang?: string;
  tenSan?: string;
}

export interface PaymentRequest {
  maHd: number;
  soTien: number;
  hinhThuc: string;
  nguoiTt: string;
}

export interface PaymentResponse {
  maTt: number;
  maHd: number;
  soTien: number;
  hinhThuc: string;
  nguoiTt: string;
  ngayTt: string;
  trangThai: string;
  message: string;
}

class InvoiceService {
  /**
   * Tạo hóa đơn mới
   * @param request Thông tin tạo hóa đơn
   * @returns Mã hóa đơn vừa tạo
   */
  async createInvoice(request: CreateInvoiceRequest): Promise<number> {
    try {
      const payload = {
        maPhieu: request.maPhieu,
        maGiamGia: request.maGiamGia || null,
        phanTramThue: request.phanTramThue || 10
      };
      
      const response = await axios.post<{ success: boolean; data: { ma_hd: number } }>(
        `${API_BASE_URL}/Invoices`,
        payload
      );
      return response.data.data.ma_hd;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lỗi khi tạo hóa đơn');
      }
      throw error;
    }
  }

  /**
   * Lấy thông tin hóa đơn theo mã
   * @param maHd Mã hóa đơn
   * @returns Thông tin hóa đơn
   */
  async getInvoiceById(maHd: number): Promise<InvoiceResponse | null> {
    try {
      const response = await axios.get<InvoiceResponse>(
        `${API_BASE_URL}/Invoices/${maHd}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return null;
        }
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy thông tin hóa đơn');
      }
      throw error;
    }
  }

  /**
   * Lấy danh sách hóa đơn của khách hàng
   * @param maKh Mã khách hàng
   * @returns Danh sách hóa đơn
   */
  async getInvoicesByCustomer(maKh: number): Promise<InvoiceResponse[]> {
    try {
      const response = await axios.get<InvoiceResponse[]>(
        `${API_BASE_URL}/Invoices/customer/${maKh}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách hóa đơn');
      }
      throw error;
    }
  }

  /**
   * Thanh toán hóa đơn
   * @param request Thông tin thanh toán
   * @returns Thông tin thanh toán
   */
  async payInvoice(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await axios.post<PaymentResponse>(
        `${API_BASE_URL}/Invoices/pay`,
        request
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lỗi khi thanh toán hóa đơn');
      }
      throw error;
    }
  }

  /**
   * Hủy hóa đơn
   * @param maHd Mã hóa đơn cần hủy
   * @returns true nếu hủy thành công
   */
  async cancelInvoice(maHd: number): Promise<boolean> {
    try {
      const response = await axios.delete<boolean>(
        `${API_BASE_URL}/Invoices/${maHd}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lỗi khi hủy hóa đơn');
      }
      throw error;
    }
  }

  /**
   * Lấy danh sách hóa đơn đã thanh toán
   * @returns Danh sách hóa đơn đã thanh toán
   */
  async getPaidInvoices(): Promise<InvoiceResponse[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<{ success: boolean; data: InvoiceResponse[] }>(
        `${API_BASE_URL}/Invoices/all?trangThai=da_tt`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
      return response.data.data || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách hóa đơn đã thanh toán');
      }
      throw error;
    }
  }

  /**
   * Lấy tất cả hóa đơn (for admin)
   * @param token Token authentication
   * @returns Danh sách tất cả hóa đơn
   */
  async getAllInvoices(token?: string): Promise<InvoiceResponse[]> {
    try {
      const response = await axios.get<{ success: boolean; data: InvoiceResponse[] }>(
        `${API_BASE_URL}/Invoices/all`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
      return response.data.data || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách hóa đơn');
      }
      throw error;
    }
  }

  /**
   * Cập nhật hóa đơn (thêm/thay đổi mã giảm giá)
   * @param maHd Mã hóa đơn
   * @param data Dữ liệu cập nhật (maGiamGia, testRollback)
   * @returns true nếu cập nhật thành công
   */
  async updateInvoice(maHd: number, data: { maGiamGia?: string | null; testRollback?: boolean }): Promise<boolean> {
    try {
      const response = await axios.put<{ success: boolean }>(
        `${API_BASE_URL}/Invoices/${maHd}`,
        data
      );
      return response.data.success;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật hóa đơn');
      }
      throw error;
    }
  }

  /**
   * Xem chi tiết hóa đơn với REPEATABLE READ (tránh Unrepeatable Read)
   * @param maHd Mã hóa đơn
   * @returns Chi tiết hóa đơn
   */
  async getInvoiceDetail(maHd: number): Promise<InvoiceDetailResponse> {
    try {
      const response = await axios.get<{ success: boolean; data: InvoiceDetailResponse }>(
        `${API_BASE_URL}/Invoices/${maHd}/detail`
      );
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lỗi khi xem chi tiết hóa đơn');
      }
      throw error;
    }
  }
}

// Export singleton instance
export const invoiceService = new InvoiceService();
export default invoiceService;
