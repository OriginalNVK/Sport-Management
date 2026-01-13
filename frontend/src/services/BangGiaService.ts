import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

type ApiWrap<T> = { success: boolean; data: T };

export async function getGia(maLoai: number, loaiNgay: "thuong" | "cuoi_tuan" | "le", khungGio: "sang" | "chieu" | "toi") {
  const res = await axios.get<ApiWrap<{ gia: number }>>(`${API_BASE}/banggia/price`, { params: { maLoai, loaiNgay, khungGio } });
  return res.data;
}
