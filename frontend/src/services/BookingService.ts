import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// ===== Types khớp DTO backend =====
export type BusySlot = {
  maLich: number;
  maPhieu: number;
  ngay: string; // DateOnly -> "YYYY-MM-DD"
  gioBatDau: string; // TimeOnly -> "HH:mm:ss" hoặc "HH:mm"
  gioKetThuc: string;
};

export type AvailabilityResponse = {
  isAvailable: boolean;
  message: string;
  busySlots: Array<{
    maLich: number;
    maPhieu: number;
    ngay: string;
    gioBatDau: string;
    gioKetThuc: string;
  }>;
};

export type CheckFieldAvailabilityRequest = {
  maSan: number;
  ngayDat: string; // YYYY-MM-DD
  gioBatDau: string; // HH:mm
  gioKetThuc: string; // HH:mm
};

export type CreateBookingRequest = {
  maKh: number;
  maSan: number;
  nguoiTaoPhieu?: number | null;
  ngayDat: string; // YYYY-MM-DD
  gioBatDau: string; // HH:mm
  gioKetThuc: string; // HH:mm
  hinhThuc: "online" | "truc_tiep";
  tongTien: number;
};

export type CreateBookingApiResponse = {
  success: boolean;
  message: string;
  data?: { ma_phieu: number };
};

export type BookingResponse = {
  maPhieu: number;
  maKh: number;
  maSan: number;
  nguoiTaoPhieu?: string | null;
  ngayTaoPhieu: string;
  ngayDat: string;
  gioBatDau: string;
  gioKetThuc: string;
  hinhThuc: string;
  trangThai: string;
  tongTien: number;
  tinhTrangTt: string;
};

export type UserBookingDto = {
  maPhieu: number;
  maHoaDon: number | null;
  displayText: string;
  ngayDat: string;
  gioBatDau: string;
  gioKetThuc: string;
  trangThai: string;
  tongTien: number;
  tinhTrangTt: string;
};

type ApiWrap<T> = { success: boolean; message?: string; data: T };

export async function checkAvailability(body: CheckFieldAvailabilityRequest) {
  const res = await axios.post<ApiWrap<{ isAvailable: boolean }>>(`${API_BASE}/bookings/check-availability`, body);
  return res.data;
}

export function getGia(maLoai: number, loaiNgay: string, khungGio: string) {
  return axios.get(`${API_BASE}/bookings/price`, {
    params: { maLoai, loaiNgay, khungGio },
  });
}

export async function createBooking(body: CreateBookingRequest, token?: string) {
  const res = await axios.post<ApiWrap<{ ma_phieu: number }>>(`${API_BASE}/bookings`, body, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
  return res.data;
}

export async function getBookingsByCustomer(maKh: number, token?: string) {
  const res = await axios.get<ApiWrap<BookingResponse[]>>(`${API_BASE}/bookings/customer/${maKh}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
  return res.data;
}

export async function cancelBooking(maPhieu: number, token?: string) {
  const res = await axios.delete<ApiWrap<unknown>>(`${API_BASE}/bookings/${maPhieu}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
  return res.data;
}

export async function getMyBookings(token?: string) {
  const res = await axios.get<ApiWrap<UserBookingDto[]>>(`${API_BASE}/bookings/me`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
  return res.data;
}
