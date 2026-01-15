import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export type SanDto = {
  maSan: number;
  tenSan: string | null;
  tinhTrang: string | null; // "con_trong" / ...
  maLoai: number | null;
  maCoSo: number | null;
};

type ApiWrap<T> = { success: boolean; data: T; count?: number };

export async function getSans() {
  const res = await axios.get<ApiWrap<SanDto[]>>(`${API_BASE}/sans`);
  return res.data;
}
