import { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar } from "./ui/calendar";
import type { UserRole, PageType } from "../App";

import { getSans, type SanDto } from "../services/SanService";
import { getLoaiSan, type LoaiSanDto } from "../services/LoaiSanService";
import { checkAvailability, createBooking } from "../services/BookingService";

// Nếu bạn chưa có 2 API này thì tạo (mình đã gửi code backend trước đó)
import { getGia } from "../services/BangGiaService";
import { findCustomerByPhone, type KhachHangDto } from "../services/KhachHangService";

interface BookingProps {
  userRole: UserRole;
  onNavigate: (page: PageType) => void;
}

// ===== Helpers =====
const UNIT_MINUTES: Record<"gio" | "ca" | "tran", number> = { gio: 60, ca: 120, tran: 90 };

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
  const day = d.getDay(); // 0 CN, 6 T7
  return day === 0 || day === 6 ? "cuoi_tuan" : "thuong";
}

function getKhungGio(gioBatDau: string): "sang" | "chieu" | "toi" {
  const [h] = gioBatDau.split(":").map(Number);
  if (h < 12) return "sang";
  if (h < 18) return "chieu";
  return "toi";
}

export function Booking({ userRole, onNavigate }: BookingProps) {
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
  const isCustomer = userRole === "customer";
  const [sdt, setSdt] = useState("");
  const [customerInfo, setCustomerInfo] = useState<KhachHangDto | null>(null);
  const [finding, setFinding] = useState(false);

  // ===== Booking action =====
  const [booking, setBooking] = useState(false);

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

  const donViTinh = selectedLoaiObj?.donViTinh ?? "gio";

  // Lọc sân theo tình trạng + loại
  const filteredSans = useMemo(() => {
    return sans.filter((s) => (s.tinhTrang ?? "").trim().toLowerCase() === "con_trong").filter((s) => (selectedLoai === "all" ? true : s.maLoai === selectedLoai));
  }, [sans, selectedLoai]);

  // Chỉ hiển thị sân trống theo khung giờ sau khi check
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

    // validate thời lượng theo đơn vị tính
    try {
      calcBlocks(gioBatDau, gioKetThuc, selectedLoaiObj.donViTinh);
    } catch (e: any) {
      alert(e.message);
      return;
    }

    setChecking(true);
    try {
      const ngayDat = date.toISOString().slice(0, 10);

      const results = await Promise.all(
        filteredSans.map(async (s) => {
          const r = await checkAvailability({
            maSan: s.maSan,
            ngayDat,
            gioBatDau,
            gioKetThuc,
          });
          return { maSan: s.maSan, ok: r.data.isAvailable };
        })
      );

      const set = new Set<number>();
      for (const x of results) if (x.ok) set.add(x.maSan);
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

  async function handleBookNow(s: SanDto) {
    if (!date) {
      alert("Vui lòng chọn ngày");
      return;
    }

    const loaiOfSan = loaiSans.find((ls) => ls.maLoai === s.maLoai);
    if (!loaiOfSan) {
      alert("Không xác định được loại sân của sân này");
      return;
    }

    let blocks = 0;
    try {
      blocks = calcBlocks(gioBatDau, gioKetThuc, loaiOfSan.donViTinh ?? "gio");
    } catch (e: any) {
      alert(e.message);
      return;
    }

    // (2) xác định maKh + hình thức
    let maKh: number | null = null;
    let hinhThuc: "online" | "truc_tiep" = "online";

    if (isCustomer) {
      // bạn đang lưu maKh ở đâu thì lấy ở đó
      const stored = localStorage.getItem("maKh");
      maKh = stored ? Number(stored) : null;
      hinhThuc = "online";
    } else {
      if (!customerInfo) {
        alert("Lễ tân: hãy nhập SĐT và tìm khách trước khi đặt");
        return;
      }
      maKh = customerInfo.maKh;
      hinhThuc = "truc_tiep";
    }

    if (!maKh || Number.isNaN(maKh)) {
      alert("Không xác định được mã khách hàng");
      return;
    }

    // (3) check availability lần cuối cho sân này (tránh race)
    try {
      const ngayDat = date.toISOString().slice(0, 10);
      const av = await checkAvailability({
        maSan: s.maSan,
        ngayDat,
        gioBatDau,
        gioKetThuc,
      });

      if (!av.data.isAvailable) {
        alert("Sân vừa có lịch bận. Vui lòng chọn sân/giờ khác.");
        return;
      }

      // (4) tính tiền theo bang_gia
      const loaiNgay = getLoaiNgay(date); // thuong/cuoi_tuan (le bạn bổ sung sau)
      const khungGio = getKhungGio(gioBatDau); // sang/chieu/toi
      const giaRes = await getGia(loaiOfSan.maLoai, loaiNgay, khungGio);
      const gia = giaRes.data.gia ?? 0;
      const tongTien = gia * blocks;

      // (5) tạo booking
      setBooking(true);
      const createRes = await createBooking({
        maKh,
        maSan: s.maSan,
        ngayDat,
        gioBatDau,
        gioKetThuc,
        hinhThuc,
        tongTien,
      });

      if (!createRes.success) {
        alert(createRes.message ?? "Đặt sân thất bại");
        return;
      }

      alert(`Đặt sân thành công! Mã phiếu: ${createRes.data?.ma_phieu}`);

      // reset availability để user thấy list cập nhật sau lần check tiếp
      setAvailableSet(new Set());

      // nếu bạn muốn chuyển trang thanh toán sau này:
      // onNavigate("payment");
    } catch (e: any) {
      alert(e?.message ?? "Lỗi khi đặt sân");
    } finally {
      setBooking(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // ==========================
  // CUSTOMER VIEW
  // ==========================
  if (isCustomer) {
    return (
      <div className="p-8">
        <h1 className="mb-8 text-gray-800">Stadium Booking</h1>

        {/* Filter by loai_san */}
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

        {/* Time input + constraint */}
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

        {/* Stadiums Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displaySans.map((s) => (
            <div key={s.maSan} className="border rounded-lg p-6 bg-white">
              <h3 className="mb-2 text-gray-900">{s.tenSan ?? `Sân ${s.maSan}`}</h3>
              <div className="text-gray-600 mb-4">Tình trạng: {s.tinhTrang}</div>

              <button disabled={booking} onClick={() => handleBookNow(s)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {booking ? "Đang đặt..." : "Book Now"}
              </button>
            </div>
          ))}
        </div>

        {displaySans.length === 0 && <div className="text-center py-12 text-gray-500">Không có sân trống theo ngày/giờ đã chọn.</div>}
      </div>
    );
  }

  // ==========================
  // STAFF / MANAGER VIEW
  // ==========================
  // (Giữ UI quản lý, nhưng bổ sung phần lễ tân đặt trực tiếp)
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-800">Booking Management</h1>
        <p className="text-gray-600 mt-2">Manage all stadium bookings and reservations</p>
      </div>

      {/* Receptionist booking block */}
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

          <div className="flex flex-wrap gap-4 items-end">
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
          </div>

          {/* Filter by loai_san */}
          <div>
            <h3 className="mb-3 text-gray-700">Chọn loại sân</h3>
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

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              Đơn vị tính: <b>{donViTinh}</b> ({UNIT_MINUTES[donViTinh]} phút)
            </div>

            <Button disabled={checking || filteredSans.length === 0 || selectedLoai === "all"} onClick={handleCheckAvailability}>
              {checking ? "Đang kiểm tra..." : "Kiểm tra sân trống"}
            </Button>
          </div>

          {loading && <div className="text-gray-600">Đang tải...</div>}
          {error && <div className="text-red-600">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displaySans.map((s) => (
              <Card key={s.maSan} className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-900 font-medium">{s.tenSan ?? `Sân ${s.maSan}`}</p>
                      <p className="text-sm text-gray-600 mt-1">Tình trạng: {s.tinhTrang}</p>
                    </div>
                    <Button disabled={booking} onClick={() => handleBookNow(s)}>
                      {booking ? "Đang đặt..." : "Book Now"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {displaySans.length === 0 && <div className="text-center py-6 text-gray-500">Không có sân trống theo ngày/giờ đã chọn.</div>}
        </CardContent>
      </Card>

      {/* Stats (giữ nguyên demo) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

      {/* Calendar block (giữ) */}
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
    </div>
  );
}
