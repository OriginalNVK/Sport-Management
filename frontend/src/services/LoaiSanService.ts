import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export type LoaiSanDto = {
  maLoai: number;
  tenLoai: string | null;
  donViTinh: "gio" | "ca" | "tran";
  moTa?: string | null;
};

type ApiWrap<T> = { success: boolean; data: T; count?: number };

export async function getLoaiSan() {
  const res = await axios.get<ApiWrap<LoaiSanDto[]>>(`${API_BASE}/loaisan`);
  return res.data;
}
