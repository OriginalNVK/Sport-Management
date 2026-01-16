// =====================
// Shared types
// =====================
export type ReportFilterRequest = {
  fromDate: string; // yyyy-MM-dd
  toDate: string;   // yyyy-MM-dd
  maCoSo?: number | null;
  maLoaiSan?: number | null;
  operatingStart?: string; // "06:00:00"
  operatingEnd?: string;   // "23:00:00"
};

export type RevenueByCoSoDto = {
  maCoSo: number;
  tenCoSo: string;
  doanhThu: number;
  soHoaDonThanhCong: number;
};

export type RevenueByLoaiSanDto = {
  maLoai: number;
  tenLoai: string;
  doanhThu: number;
  soHoaDonThanhCong: number;
};

export type UtilizationByLoaiSanDto = {
  maLoai: number;
  tenLoai: string;
  soSan: number;
  tongPhutDat: number;
  tongPhutKhaDung: number;
  tyLeSuDung: number; // 0..1
};

export type UtilizationByCoSoDto = {
  maCoSo: number;
  tenCoSo: string;
  soSan: number;
  tongPhutDat: number;
  tongPhutKhaDung: number;
  tyLeSuDung: number; // 0..1
};

export type BookingChannelStatsDto = {
  online: number;
  trucTiep: number;
  tong: number;
};

export type CancelNoShowStatsDto = {
  soLuongHuy: number;
  soLuongNoShow: number;
  tongTienPhatHuy: number;
  tongTienPhatNoShow: number;
};

export type ReportSummaryResponse = {
  filter: ReportFilterRequest;
  doanhThuTheoCoSo: RevenueByCoSoDto[];
  doanhThuTheoLoaiSan: RevenueByLoaiSanDto[];
  tyLeSuDungTheoCoSo: UtilizationByCoSoDto[];
  tyLeSuDungTheoLoaiSan: UtilizationByLoaiSanDto[];
  datOnlineTrucTiep: BookingChannelStatsDto;
  huyNoShow: CancelNoShowStatsDto;
};

// =====================
// Customer dashboard types
// =====================
export type BookingResponse = {
  maPhieu: number;
  maKh: number;
  maSan: number;
  ngayDat: string;      // yyyy-MM-dd
  gioBatDau: string;    // HH:mm:ss
  gioKetThuc: string;   // HH:mm:ss
  hinhThuc?: string;    // online, truc_tiep
  trangThai: string;    // cho_xac_nhan, da_xac_nhan, huy...
  tongTien: number;
  tinhTrangTt: string;  // chua_tt, da_tt, hoan_tien
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/**
 * Manager dashboard summary
 * Endpoint (với API_BASE đã gồm /api/v1):
 * POST {API_BASE}/dashboard/summary
 */
export async function fetchDashboardSummary(
  filter: ReportFilterRequest,
  token?: string
): Promise<ReportSummaryResponse> {
  const res = await fetch(`${API_BASE}/dashboard/summary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(filter),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      json?.message ||
      json?.error ||
      `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return json.data as ReportSummaryResponse; // backend wraps { success, data }
}

/**
 * Customer dashboard - fetch bookings by customer
 * Endpoint (với API_BASE đã gồm /api/v1):
 * GET {API_BASE}/bookings/customer/{maKh}
 */
export async function fetchBookingsByCustomer(
  maKh: number
): Promise<BookingResponse[]> {
  const res = await fetch(`${API_BASE}/bookings/customer/${maKh}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      json?.message ||
      json?.error ||
      `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return (json?.data ?? []) as BookingResponse[];
}
