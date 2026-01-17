import { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import type { UserRole, PageType } from "../App";

import { getSans, type SanDto } from "../services/SanService";
import { getLoaiSan, type LoaiSanDto } from "../services/LoaiSanService";
import { checkAvailability, createBooking, getGia, getReceptionistCreated } from "../services/BookingService";

// Nếu bạn chưa có 2 API này thì tạo (mình đã gửi code backend trước đó)
import { findCustomerByPhone, type KhachHangDto } from "../services/KhachHangService";

interface BookingProps {
  userRole: UserRole;
  onNavigate: (page: PageType) => void;
}

// ===== Helpers =====
type DonViTinh = "gio" | "ca" | "tran";

function normalizeDonViTinh(input: any): DonViTinh {
  const v = String(input ?? "")
    .trim()
    .toLowerCase();

  if (v === "gio" || v === "giờ" || v === "hour") return "gio";
  if (v === "ca" || v === "cả" || v === "shift") return "ca";
  if (v === "tran" || v === "trận" || v === "match") return "tran";

  // fallback an toàn
  return "gio";
}

type VaiTro = "khach_hang" | "le_tan" | "quan_ly" | "nhan_vien" | string;

// map từ UserRole (nếu bạn đang dùng enum/union khác) -> VaiTro theo backend
function mapUserRoleToVaiTro(userRole?: any): VaiTro | null {
  if (!userRole) return null;

  // tùy hệ bạn đặt: "customer" | "staff" | ...
  // chỉnh lại cho khớp project bạn
  if (userRole === "customer") return "khach_hang";
  if (userRole === "receptionist") return "le_tan";
  if (userRole === "manager") return "quan_ly";
  if (userRole === "staff") return "nhan_vien";

  return null;
}

function normalizeTime(t: string) {
  return t.length === 5 ? `${t}:00` : t;
}

const UNIT_MINUTES: Record<DonViTinh, number> = { gio: 60, ca: 120, tran: 90 };

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function calcBlocks(start: string, end: string, donViTinh: "gio" | "ca" | "tran") {
  const diff = toMinutes(end) - toMinutes(start);
  const unit = UNIT_MINUTES[donViTinh];
  if (diff <= 0) throw new Error("Giờ kết thúc phải lớn hơn giờ bắt đầu");
  if (diff % unit !== 0) throw new Error(`Thời lượng thuê phải chia hết cho ${unit} phút (${donViTinh})`);
  return diff / unit;
}

function getLoaiNgay(d: Date): "thuong" | "cuoi_tuan" {
  const day = d.getDay();
  return day === 0 || day === 6 ? "cuoi_tuan" : "thuong";
}

function getKhungGio(gioBatDau: string): "sang" | "chieu" | "toi" {
  const [h] = gioBatDau.split(":").map(Number);
  if (h < 12) return "sang";
  if (h < 18) return "chieu";
  return "toi";
}

export function Booking({ userRole, onNavigate }: BookingProps) {
  const vaiTro = useMemo(() => mapUserRoleToVaiTro(userRole), [userRole]);
  const isLeTan = vaiTro === "le_tan";

  // ===== Data load =====
  const [loaiSans, setLoaiSans] = useState<LoaiSanDto[]>([]);
  const [sans, setSans] = useState<SanDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== Filters =====
  const [selectedLoai, setSelectedLoai] = useState<number | "all">("all");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [gioBatDau, setGioBatDau] = useState("18:00");
  const [gioKetThuc, setGioKetThuc] = useState("20:00");

  // ===== Availability =====
  const [checking, setChecking] = useState(false);
  const [availableSet, setAvailableSet] = useState<Set<number>>(new Set());

  // ===== Receptionist: find customer by phone =====
  const [sdt, setSdt] = useState("");
  const [customerInfo, setCustomerInfo] = useState<KhachHangDto | null>(null);
  const [finding, setFinding] = useState(false);

  // ===== Booking action =====
  const [booking, setBooking] = useState(false);

  // ===== Confirm modal =====
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedSan, setSelectedSan] = useState<SanDto | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [priceInfo, setPriceInfo] = useState<{
    gia: number;
    soDonVi: number;
    tongTien: number;
    loaiNgay: "thuong" | "cuoi_tuan";
    khungGio: "sang" | "chieu" | "toi";
    donViTinh: "gio" | "ca" | "tran";
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [loaiRes, sanRes] = await Promise.all([getLoaiSan(), getSans()]);
        setLoaiSans(loaiRes.data ?? []);
        setSans(sanRes.data ?? []);
      } catch (e: any) {
        setError(e?.message ?? "Không tải được dữ liệu");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // reset availability khi đổi điều kiện
  useEffect(() => {
    setAvailableSet(new Set());
  }, [selectedLoai, date, gioBatDau, gioKetThuc]);

  const selectedLoaiObj = useMemo(() => {
    if (selectedLoai === "all") return null;
    return loaiSans.find((x) => x.maLoai === selectedLoai) ?? null;
  }, [selectedLoai, loaiSans]);

  const donViTinh = (selectedLoaiObj?.donViTinh ?? "gio") as "gio" | "ca" | "tran";

  const filteredSans = useMemo(() => {
    return sans.filter((s) => (s.tinhTrang ?? "").trim().toLowerCase() === "con_trong").filter((s) => (selectedLoai === "all" ? true : s.maLoai === selectedLoai));
  }, [sans, selectedLoai]);

  const displaySans = useMemo(() => {
    if (availableSet.size === 0) return filteredSans;
    return filteredSans.filter((s) => availableSet.has(s.maSan));
  }, [filteredSans, availableSet]);

  async function handleCheckAvailability() {
    if (!date) {
      alert("Vui lòng chọn ngày");
      return;
    }
    if (!selectedLoaiObj) {
      alert("Hãy chọn loại sân trước");
      return;
    }
    if (filteredSans.length === 0) {
      alert("Không có sân phù hợp để kiểm tra");
      return;
    }

    try {
      calcBlocks(gioBatDau, gioKetThuc, (selectedLoaiObj.donViTinh ?? "gio") as any);
    } catch (e: any) {
      alert(e.message);
      return;
    }

    setChecking(true);
    try {
      const ngayDat = date.toISOString().slice(0, 10);
      const token = localStorage.getItem("token");
      const set = new Set<number>();

      for (let i = 0; i < filteredSans.length; i += 10) {
        const chunk = filteredSans.slice(i, i + 10);
        const resChunk = await Promise.all(
          chunk.map(async (s) => {
            const r = await checkAvailability(
              {
                maSan: s.maSan,
                ngayDat,
                gioBatDau: normalizeTime(gioBatDau),
                gioKetThuc: normalizeTime(gioKetThuc),
              },
              token ?? undefined
            );
            return { maSan: s.maSan, ok: !!r.data.isAvailable };
          })
        );
        for (const x of resChunk) if (x.ok) set.add(x.maSan);
      }

      setAvailableSet(set);

      if (set.size === 0) alert("Không có sân trống trong khung giờ này.");
    } catch (e: any) {
      alert(e?.message ?? "Lỗi khi kiểm tra sân trống");
    } finally {
      setChecking(false);
    }
  }

  async function handleFindCustomer() {
    const phone = sdt.trim();
    if (!phone) return;

    setFinding(true);
    try {
      const res = await findCustomerByPhone(phone);
      setCustomerInfo(res.data ?? null);
      if (!res.data) alert("Không tìm thấy khách theo SĐT này");
    } catch (e: any) {
      alert(e?.message ?? "Lỗi tìm khách hàng");
    } finally {
      setFinding(false);
    }
  }

  // ==========================
  // OPEN CONFIRM MODAL (preview info + price)
  // ==========================
  async function handleOpenConfirm(s: SanDto) {
    if (!date) {
      alert("Vui lòng chọn ngày");
      return;
    }

    const loaiOfSan = loaiSans.find((ls) => ls.maLoai === s.maLoai);
    if (!loaiOfSan) {
      alert("Không xác định được loại sân của sân này");
      return;
    }

    if (isLeTan && !customerInfo) {
      alert("Lễ tân: hãy nhập SĐT và bấm 'Tìm khách' trước khi đặt.");
      return;
    }

    try {
      calcBlocks(gioBatDau, gioKetThuc, (loaiOfSan.donViTinh ?? "gio") as any);

      const ngayDat = date.toISOString().slice(0, 10);
      const token = localStorage.getItem("token");

      setConfirmLoading(true);
      setSelectedSan(s);

      // check availability (preview)
      const av = await checkAvailability(
        {
          maSan: s.maSan,
          ngayDat,
          gioBatDau: normalizeTime(gioBatDau),
          gioKetThuc: normalizeTime(gioKetThuc),
        },
        token ?? undefined
      );

      if (!av.data.isAvailable) {
        alert("Sân vừa có lịch bận. Vui lòng chọn sân/giờ khác.");
        setSelectedSan(null);
        return;
      }

      // get price preview
      const loaiNgay = getLoaiNgay(date);
      const khungGio = getKhungGio(gioBatDau);
      const giaRes = await getGia(loaiOfSan.maLoai, loaiNgay, khungGio, token ?? undefined);
      const gia = giaRes.data?.data?.gia ?? 0;

      const totalMinutes = toMinutes(gioKetThuc) - toMinutes(gioBatDau);
      const dv = normalizeDonViTinh(loaiOfSan.donViTinh);
      const unitMinutes = UNIT_MINUTES[dv];

      const soDonVi = Math.round(totalMinutes / unitMinutes);

      const tongTien = gia * soDonVi;

      setPriceInfo({
        gia,
        soDonVi,
        tongTien,
        loaiNgay,
        khungGio,
        donViTinh: (loaiOfSan.donViTinh ?? "gio") as any,
      });

      setOpenConfirm(true);
    } catch (e: any) {
      alert(e?.message ?? "Lỗi chuẩn bị thông tin đặt sân");
      setSelectedSan(null);
      setPriceInfo(null);
    } finally {
      setConfirmLoading(false);
    }
  }

  // ==========================
  // CONFIRM BOOKING (call createBooking)
  // ==========================
  async function handleConfirmBooking() {
    if (!selectedSan || !date) return;

    const loaiOfSan = loaiSans.find((ls) => ls.maLoai === selectedSan.maLoai);
    if (!loaiOfSan) {
      alert("Không xác định được loại sân");
      return;
    }

    let hinhThuc: "online" | "truc_tiep";
    let nguoiTaoPhieu: string | null = null;
    let resolvedMaKh: number;

    if (!isLeTan) {
      const stored = localStorage.getItem("maKh");
      const mk = stored ? Number(stored) : NaN;
      if (!mk || Number.isNaN(mk)) {
        alert("Không xác định được mã khách hàng (maKh). Vui lòng đăng nhập lại.");
        return;
      }
      resolvedMaKh = mk;
      hinhThuc = "online";
    } else {
      if (!customerInfo) {
        alert("Lễ tân: hãy tìm khách trước khi đặt.");
        return;
      }
      resolvedMaKh = customerInfo.maKh;
      hinhThuc = "truc_tiep";

      const maNvStr = localStorage.getItem("maNv");
      const maNv = maNvStr ? Number(maNvStr) : NaN;
      if (!maNv || Number.isNaN(maNv)) {
        alert("Không xác định được mã lễ tân (maNv). Vui lòng đăng nhập lại.");
        return;
      }
      const token = localStorage.getItem("token");
      const res = await getReceptionistCreated(maNv, token ?? undefined);
      nguoiTaoPhieu = res.data?.data?.ten_dang_nhap ?? null;
    }

    try {
      setBooking(true);

      const ngayDat = date.toISOString().slice(0, 10);
      const token = localStorage.getItem("token");

      // check again to avoid race condition
      const av = await checkAvailability(
        {
          maSan: selectedSan.maSan,
          ngayDat,
          gioBatDau: normalizeTime(gioBatDau),
          gioKetThuc: normalizeTime(gioKetThuc),
        },
        token ?? undefined
      );

      if (!av.data.isAvailable) {
        alert("Sân vừa có lịch bận. Vui lòng chọn sân/giờ khác.");
        return;
      }

      const tongTien = priceInfo?.tongTien ?? 0;

      const createRes = await createBooking(
        {
          maKh: resolvedMaKh,
          maSan: selectedSan.maSan,
          nguoiTaoPhieu,
          ngayDat,
          gioBatDau: normalizeTime(gioBatDau),
          gioKetThuc: normalizeTime(gioKetThuc),
          hinhThuc,
          tongTien,
        },
        token ?? undefined
      );

      if (!createRes.success) {
        alert(createRes.message ?? "Đặt sân thất bại");
        return;
      }

      alert(`Đặt sân thành công! Mã phiếu: ${createRes.data?.ma_phieu}`);

      // reset
      setOpenConfirm(false);
      setSelectedSan(null);
      setPriceInfo(null);
      setAvailableSet(new Set());
    } catch (e: any) {
      alert(e?.message ?? "Lỗi khi đặt sân");
    } finally {
      setBooking(false);
    }
  }

  function closeConfirm() {
    if (booking) return;
    setOpenConfirm(false);
    setSelectedSan(null);
    setPriceInfo(null);
  }

  const selectedSanLoaiName = useMemo(() => {
    if (!selectedSan) return "";
    return loaiSans.find((x) => x.maLoai === selectedSan.maLoai)?.tenLoai ?? `${selectedSan.maLoai}`;
  }, [selectedSan, loaiSans]);

  return (
    <div className="p-8">
      <h1 className="mb-8 text-gray-800">{isLeTan ? "Booking (Lễ tân)" : "Stadium Booking"}</h1>

      {/* ==========================
        Receptionist extra block
      ========================== */}
      {isLeTan && (
        <Card className="shadow-sm mb-6">
          <CardHeader>
            <CardTitle>Đặt sân trực tiếp (Lễ tân)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm text-gray-600 mb-1">SĐT khách hàng</label>
                <input value={sdt} onChange={(e) => setSdt(e.target.value)} className="border rounded-lg px-3 py-2" placeholder="VD: 09xxxxxxxx" />
              </div>

              <Button disabled={finding || !sdt.trim()} onClick={handleFindCustomer}>
                {finding ? "Đang tìm..." : "Tìm khách"}
              </Button>

              <div className="text-sm text-gray-700">
                {customerInfo ? (
                  <>
                    <b>{customerInfo.hoTen}</b> — Mã KH: {customerInfo.maKh}
                  </>
                ) : (
                  <span className="text-gray-500">Chưa có thông tin khách</span>
                )}
              </div>
            </div>

            {!customerInfo && (
              <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                Lễ tân: vui lòng nhập SĐT và bấm <b>Tìm khách</b> trước khi đặt sân.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ==========================
        Filter
      ========================== */}
      <div className="mb-8">
        <h3 className="mb-4 text-gray-700">Lọc theo loại sân</h3>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setSelectedLoai("all")}
            className={`px-6 py-2 rounded-lg transition-colors ${selectedLoai === "all" ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Tất cả
          </button>

          {loaiSans.map((ls) => (
            <button
              key={ls.maLoai}
              onClick={() => setSelectedLoai(ls.maLoai)}
              className={`px-6 py-2 rounded-lg transition-colors ${selectedLoai === ls.maLoai ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {ls.tenLoai ?? `Loại ${ls.maLoai}`}
            </button>
          ))}
        </div>
      </div>

      {/* ==========================
        Time input + constraint
      ========================== */}
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Ngày đặt</label>
          <input type="date" value={date ? date.toISOString().slice(0, 10) : ""} onChange={(e) => setDate(new Date(e.target.value))} className="border rounded-lg px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Giờ bắt đầu</label>
          <input type="time" value={gioBatDau} onChange={(e) => setGioBatDau(e.target.value)} className="border rounded-lg px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Giờ kết thúc</label>
          <input type="time" value={gioKetThuc} onChange={(e) => setGioKetThuc(e.target.value)} className="border rounded-lg px-3 py-2" />
        </div>

        <div className="text-sm text-gray-600">
          Đơn vị tính: <b>{donViTinh}</b> ({UNIT_MINUTES[donViTinh]} phút)
        </div>

        <button
          className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={checking || filteredSans.length === 0 || selectedLoai === "all"}
          onClick={handleCheckAvailability}
        >
          {checking ? "Đang kiểm tra..." : "Kiểm tra sân trống"}
        </button>
      </div>

      {loading && <div className="text-gray-600">Đang tải...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {/* ==========================
        Stadiums Grid
      ========================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displaySans.map((s) => (
          <div key={s.maSan} className="border rounded-lg p-6 bg-white">
            <h3 className="mb-2 text-gray-900">{s.tenSan ?? `Sân ${s.maSan}`}</h3>

            <button
              disabled={booking || confirmLoading || (isLeTan && !customerInfo)}
              onClick={() => handleOpenConfirm(s)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              title={isLeTan && !customerInfo ? "Lễ tân cần tìm khách theo SĐT trước" : undefined}
            >
              {confirmLoading && selectedSan?.maSan === s.maSan ? "Đang tải..." : "Chọn sân"}
            </button>
          </div>
        ))}
      </div>

      {displaySans.length === 0 && <div className="text-center py-12 text-gray-500">Không có sân trống theo ngày/giờ đã chọn.</div>}

      {/* ==========================
        CONFIRM MODAL
      ========================== */}
      {openConfirm && selectedSan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Xác nhận đặt sân</h2>
                <p className="text-sm text-gray-500">Kiểm tra lại thông tin trước khi tạo phiếu.</p>
              </div>
              <button onClick={closeConfirm} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">
                Đóng
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="p-3 rounded-lg border">
                <div className="font-medium text-gray-900">{selectedSan.tenSan ?? `Sân ${selectedSan.maSan}`}</div>
                <div className="text-gray-600">Mã sân: {selectedSan.maSan}</div>
                <div className="text-gray-600">Loại sân: {selectedSanLoaiName}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border">
                  <div className="text-gray-500">Ngày</div>
                  <div className="font-medium">{date?.toISOString().slice(0, 10)}</div>
                </div>
                <div className="p-3 rounded-lg border">
                  <div className="text-gray-500">Khung giờ</div>
                  <div className="font-medium">
                    {gioBatDau} - {gioKetThuc}
                  </div>
                </div>
              </div>

              {isLeTan && (
                <div className="p-3 rounded-lg border">
                  <div className="text-gray-500">Khách đặt</div>
                  <div className="font-medium">
                    {customerInfo?.hoTen} — Mã KH: {customerInfo?.maKh} — SĐT: {sdt}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg border">
                <div className="text-gray-500">Tính tiền</div>
                <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1">
                  <div>
                    Đơn vị: <b>{priceInfo?.donViTinh}</b> ({priceInfo ? UNIT_MINUTES[priceInfo.donViTinh] : ""} phút)
                  </div>
                  <div>
                    Giá: <b>{(priceInfo?.gia ?? 0).toLocaleString()}</b>
                  </div>
                  <div>
                    Số đơn vị: <b>{priceInfo?.soDonVi ?? 0}</b>
                  </div>
                  <div>
                    Tổng tiền: <b>{(priceInfo?.tongTien ?? 0).toLocaleString()}</b>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  (Loại ngày: {priceInfo?.loaiNgay} • Khung: {priceInfo?.khungGio})
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50" disabled={booking} onClick={closeConfirm}>
                Hủy
              </button>

              <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50" disabled={booking} onClick={handleConfirmBooking}>
                {booking ? "Đang tạo phiếu..." : "Xác nhận đặt"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================
        Le tan extra demo UI (giữ nguyên)
      ========================== */}
      {isLeTan && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 mt-10">
            <Card className="shadow-sm border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Bookings</p>
                    <p className="text-gray-900 mt-1">1,247</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Confirmed</p>
                    <p className="text-gray-900 mt-1">892</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-l-4 border-l-yellow-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Pending</p>
                    <p className="text-gray-900 mt-1">234</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-l-4 border-l-red-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Cancelled</p>
                    <p className="text-gray-900 mt-1">121</p>
                  </div>
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar mode="single" selected={date} onSelect={(d) => setDate(d ?? new Date())} className="rounded-md border" />
              </CardContent>
              <CardContent>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Create New Booking</Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
