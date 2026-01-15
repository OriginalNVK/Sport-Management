import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

type ApiWrap<T> = { success: boolean; data: T };

export function getGia(maLoai: number, loaiNgay: string, khungGio: string) {
  return axios.get(`${API_BASE}/booking/price`, {
    params: { maLoai, loaiNgay, khungGio },
  });
}
