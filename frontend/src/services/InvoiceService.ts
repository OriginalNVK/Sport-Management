import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Interfaces cho DTOs
export interface CreateInvoiceRequest {
  maPhieu: number;
  danhSachMaUuDai?: number[];
  phanTramThue: number;
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
      const response = await axios.post<number>(
        `${API_BASE_URL}/Invoices`,
        request
      );
      return response.data;
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
   * Lấy tất cả hóa đơn (có thể lọc theo trạng thái)
   * @param trangThai Trạng thái thanh toán (chua_tt, da_tt, hoan_tien)
   * @returns Danh sách hóa đơn
   */
  async getAllInvoices(trangThai?: string): Promise<InvoiceResponse[]> {
    try {
      const params = trangThai ? { trangThai } : {};
      const response = await axios.get<InvoiceResponse[]>(
        `${API_BASE_URL}/Invoices/all`,
        { params }
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
        `${API_BASE_URL}/Invoices/all/da_tt`,
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
}

// Export singleton instance
export const invoiceService = new InvoiceService();
export default invoiceService;
