import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface AddChiTietDvRequest {
  ma_phieu: number;
  ma_dv: number;
  so_luong: number;
}

export interface ServiceInfoResponse {
  maDv: number;
  tenDv?: string;
  loaiDv?: string;
  donGia: number;
  donVi?: string;
  trangThai?: string;
  maCoSo?: number;
  soLuongTon?: number;
  ngayCapNhat?: string;
}

export interface ServiceInfoListResponse<T> {
  data: T[];
  count: number;
}

class BookingExtraService {
  async AddChiTietDv(request: AddChiTietDvRequest): Promise<number> {
    try {
      const response = await axios.post<number>(`${API_BASE_URL}/BookingExtras/service`, request);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error((error.response?.data as any)?.message || 'Lỗi khi thêm dịch vụ');
      }
      throw error;
    }
  }

  async getServiceList(maCoSo: number, params?: {
    keyword?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: ServiceInfoResponse[]; count: number }> {
    const response = await axios.get<ServiceInfoListResponse<ServiceInfoResponse>>(
      `${API_BASE_URL}/BookingExtras/services/${maCoSo}`,
      { params }
    );

    return { data: response.data.data, count: response.data.count };
  }

  /**
   * ✅ Thêm NHIỀU dịch vụ vào 1 phiếu (client-side batch)
   * Vì backend hiện tại chỉ có endpoint add 1 item / lần.
   */
  async addManyServicesToPhieu(payload: {
    ma_phieu: number;
    items: Array<{ ma_dv: number; so_luong: number }>;
  }): Promise<number[]> {
    const { ma_phieu, items } = payload;

    // gọi lần lượt hoặc song song. Thường song song ok:
    const results = await Promise.all(
      items.map((it) =>
        this.AddChiTietDv({
          ma_phieu,
          ma_dv: it.ma_dv,
          so_luong: it.so_luong,
        })
      )
    );

    return results; // list mã chi tiết dv vừa tạo
  }
}

export const bookingExtraService = new BookingExtraService();
export default bookingExtraService;
