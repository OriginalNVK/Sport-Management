// src/services/KhachHangService.ts
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

type ApiWrap<T> = { success: boolean; data: T };

export type KhachHangDto = {
  maKh: number;
  hoTen: string | null;
  sdt: string | null;
  email?: string | null;
};

export async function findCustomerByPhone(sdt: string, token?: string) {
  const res = await axios.get<ApiWrap<KhachHangDto | null>>(`${API_BASE}/khachhang/by-phone`, {
    params: { sdt },
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  });
  return res.data;
}
