// import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// // Interfaces cho DTOs
// export interface AddChiTietDvRequest {
//   ma_phieu: number;
//   ma_dv: number;
//   so_luong: number;
// }

// export interface ChiTietDvResponse {
//   ma_ct: number;
//   ma_phieu: number;
//   ma_dv: number;
//   ten_dv?: string;
//   so_luong: number;
//   don_gia: number;
//   thanh_tien: number;
// }

// export interface AddLichHlvRequest {
//   ma_phieu: number;
//   ma_hlv: number;
//   gio_bat_dau: string;
//   gio_ket_thuc: string;
// }

// export interface LichHlvResponse {
//   ma_lich: number;
//   ma_phieu: number;
//   ms_hlv: number;
//   ho_ten: string;
//   gio_bat_dau: string;
//   gio_ket_thuc: string;
//   don_gia: string;
//   thanh_tien: string;
// }

// export interface ServiceInfoResponse {
//   maDv: number;
//   tenDv?: string;
//   loaiDv?: string;
//   donGia: number;
//   donVi?: string;
//   trangThai?: string;
//   maCoSo?: number;
//   soLuongTon?: number;
//   ngayCapNhat?: string;
//   icon?: string
// }

// export interface ServiceInfoListResponse<T> {
//   data: T[];
//   count: number
// }

// class BookingExtraService {
//   /**
//    * Thêm chi tiết dịch vụ vào phiếu đặt sân
//    * @param request Thông tin chi tiết dịch vụ
//    * @returns Mã chi tiết dịch vụ vừa tạo
//    */
//   async AddChiTietDv(request: AddChiTietDvRequest): Promise<number> {
//     try {
//       const response = await axios.post<number>(
//         `${API_BASE_URL}/BookingExtras/service`,
//         request
//       );
//       return response.data;
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         throw new Error(error.response?.data?.message || 'Lỗi khi thêm dịch vụ');
//       }
//       throw error;
//     }
//   }

//   /**
//    * Lấy thông tin dịch vụ theo mã
//    * @param MaDv Mã dv
//    * @returns Thông tin dịch vụ
//    */
//   async getServiceInfoById(MaDv: number): Promise<ServiceInfoResponse | null> {
//     try {
//       const response = await axios.get<ServiceInfoResponse>(
//         `${API_BASE_URL}/BookingExtras/service/${MaDv}`
//       );
//       return response.data;
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         if (error.response?.status === 404) {
//           return null;
//         }
//         throw new Error(error.response?.data?.message || 'Lỗi khi lấy thông tin dịch vụ');
//       }
//       throw error;
//     }
//   }

//   /**
//    * Lấy danh sách dịch vụ
//    * @param 
//    * @returns Danh sách dịch vụ
//    */
//   async getServiceList(params?: {
//     keyword?: string;
//     page?: number;
//     pageSize?: number;
//     }): Promise<{ data: ServiceInfoResponse[]; count: number }> {
//     const response = await axios.get<ServiceInfoListResponse<ServiceInfoResponse>>(
//         `${API_BASE_URL}/BookingExtras/services`,
//         { params }
//     );

//     return {
//         data: response.data.data,
//         count: response.data.count
//     };
//     }
    
// }

// // Export singleton instance
// export const bookingExtraService = new BookingExtraService();
// export default bookingExtraService;

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

  async getServiceList(params?: {
    keyword?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: ServiceInfoResponse[]; count: number }> {
    const response = await axios.get<ServiceInfoListResponse<ServiceInfoResponse>>(
      `${API_BASE_URL}/BookingExtras/services`,
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
