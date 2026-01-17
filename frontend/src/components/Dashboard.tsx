import { useEffect, useMemo, useState } from "react";
import { Users, Building2, Calendar, DollarSign, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import type { UserRole } from "../App";

import { fetchDashboardSummary, type ReportFilterRequest, type ReportSummaryResponse } from "../services/DashboardService";
import { formatVnd, pickColor, toIsoDate } from "../services/DashboardFormat";

interface DashboardProps {
  userRole: UserRole;
}

export function Dashboard({ userRole }: DashboardProps) {
  if (userRole === "customer") return <CustomerDashboard />;
  return <ManagerDashboard />;
}

// =======================
// CUSTOMER DASHBOARD (MOCK UI)
// =======================
function CustomerDashboard() {
  const schedules = [
    { id: 1, sport: "Football", field: "Field A", date: "2025-12-05", time: "14:00 - 16:00", status: "confirmed" },
    { id: 2, sport: "Volleyball", field: "Court B", date: "2025-12-08", time: "10:00 - 12:00", status: "confirmed" },
    { id: 3, sport: "Basketball", field: "Court C", date: "2025-12-10", time: "18:00 - 20:00", status: "pending" },
  ];

  const invoiceSummary = { totalPaid: 450, totalPending: 150, nextDue: "2025-12-10" };

  return (
    <div className="p-8">
      <h1 className="mb-8 text-gray-800">Dashboard</h1>

      {/* Schedule Section */}
      <section className="mb-8">
        <h2 className="mb-4 text-gray-700">Your Schedule</h2>
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <h3 className="text-gray-900">{schedule.sport}</h3>
                  </div>
                  <p className="text-gray-600 mb-1">{schedule.field}</p>

                  <div className="flex items-center gap-4 text-gray-600">
                    <span>{schedule.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {schedule.time}
                    </span>
                  </div>

                  <span className={`inline-block mt-3 px-3 py-1 rounded-full text-sm ${schedule.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {schedule.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Update</button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Cancel</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Invoice Summary Section */}
      <section>
        <h2 className="mb-4 text-gray-700">Invoice Summary</h2>
        <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600">Total Paid</p>
                <p className="text-2xl text-gray-900">${invoiceSummary.totalPaid}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-gray-600">Pending Payment</p>
                <p className="text-2xl text-gray-900">${invoiceSummary.totalPending}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600">Next Due Date</p>
                <p className="text-xl text-gray-900">{invoiceSummary.nextDue}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// =======================
// MANAGER DASHBOARD (REAL DATA) - giữ nguyên code của bạn
// =======================
function ManagerDashboard() {
  const today = useMemo(() => new Date(), []);
  const defaultFrom = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 29);
    return d;
  }, [today]);

  const [filter, setFilter] = useState<ReportFilterRequest>(() => ({
    fromDate: toIsoDate(defaultFrom),
    toDate: toIsoDate(today),
    maCoSo: null,
    maLoaiSan: null,
    operatingStart: "06:00:00",
    operatingEnd: "23:00:00",
  }));

  const [summary, setSummary] = useState<ReportSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const token = localStorage.getItem("access_token") ?? undefined;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchDashboardSummary(filter, token);
      setSummary(res);
    } catch (e: any) {
      setSummary(null);
      setError(e?.message ?? "Không thể tải dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bookingData = useMemo(() => {
    if (!summary) return [];
    return summary.doanhThuTheoCoSo.map((x) => ({
      month: x.tenCoSo,
      bookings: x.soHoaDonThanhCong,
    }));
  }, [summary]);

  const revenueData = useMemo(() => {
    if (!summary) return [];
    return summary.doanhThuTheoCoSo.map((x) => ({
      month: x.tenCoSo,
      revenue: x.doanhThu,
    }));
  }, [summary]);

  const stadiumUsage = useMemo(() => {
    if (!summary) return [];
    return summary.tyLeSuDungTheoLoaiSan.map((x, idx) => ({
      name: x.tenLoai,
      value: Math.round((x.tyLeSuDung ?? 0) * 1000) / 10,
      color: pickColor(idx),
    }));
  }, [summary]);

  const totalBookings = summary?.datOnlineTrucTiep?.tong ?? 0;
  const totalRevenue = summary?.doanhThuTheoCoSo?.reduce((sum, x) => sum + (x.doanhThu ?? 0), 0) ?? 0;
  const activeStadiums = summary?.tyLeSuDungTheoCoSo?.reduce((sum, x) => sum + (x.soSan ?? 0), 0) ?? 0;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your sports facilities today.</p>
          {summary && (
            <p className="text-gray-500 text-sm mt-2">
              Range: {summary.filter.fromDate} → {summary.filter.toDate}
            </p>
          )}
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>

        <div className="w-full max-w-xl">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-700">Report Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="text-sm text-gray-600">
                  From
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 bg-white"
                    value={filter.fromDate}
                    onChange={(e) => setFilter((p) => ({ ...p, fromDate: e.target.value }))}
                  />
                </label>

                <label className="text-sm text-gray-600">
                  To
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 bg-white"
                    value={filter.toDate}
                    onChange={(e) => setFilter((p) => ({ ...p, toDate: e.target.value }))}
                  />
                </label>

                <label className="text-sm text-gray-600">
                  MaCoSo (optional)
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 bg-white"
                    value={filter.maCoSo ?? ""}
                    onChange={(e) => setFilter((p) => ({ ...p, maCoSo: e.target.value === "" ? null : Number(e.target.value) }))}
                    placeholder="e.g. 1"
                  />
                </label>

                <label className="text-sm text-gray-600">
                  MaLoaiSan (optional)
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 bg-white"
                    value={filter.maLoaiSan ?? ""}
                    onChange={(e) => setFilter((p) => ({ ...p, maLoaiSan: e.target.value === "" ? null : Number(e.target.value) }))}
                    placeholder="e.g. 1"
                  />
                </label>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="text-sm text-gray-600">{loading ? "Loading..." : "Ready"}</div>
                <button onClick={load} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60" disabled={loading}>
                  Apply
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Total Users</CardTitle>
            <Users className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">—</p>
            <div className="text-gray-500 text-sm mt-1">(add endpoint later)</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Active Stadiums</CardTitle>
            <Building2 className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">{activeStadiums.toLocaleString("vi-VN")}</p>
            <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
              <TrendingUp className="w-4 h-4" />
              <span>Utilization-based</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Total Bookings</CardTitle>
            <Calendar className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">{totalBookings.toLocaleString("vi-VN")}</p>
            <div className="text-gray-500 text-sm mt-1">
              Online: {summary?.datOnlineTrucTiep.online ?? 0} · Trực tiếp: {summary?.datOnlineTrucTiep.trucTiep ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Revenue</CardTitle>
            <DollarSign className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">{formatVnd(totalRevenue)}</p>
            <div className="text-gray-500 text-sm mt-1">Paid only</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Booking Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-2">*Chart đang hiển thị số booking theo cơ sở.</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: any) => formatVnd(Number(v))} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-2">*Chart đang hiển thị doanh thu theo cơ sở.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Stadium Usage by Type</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={stadiumUsage} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" nameKey="name">
                  {stadiumUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="flex-1">
                  <p className="text-gray-900">
                    Canceled bookings: <b>{summary?.huyNoShow.soLuongHuy ?? 0}</b>
                  </p>
                  <p className="text-gray-500 text-sm">Penalty: {formatVnd(summary?.huyNoShow.tongTienPhatHuy ?? 0)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <div className="flex-1">
                  <p className="text-gray-900">
                    No-show: <b>{summary?.huyNoShow.soLuongNoShow ?? 0}</b>
                  </p>
                  <p className="text-gray-500 text-sm">Penalty: {formatVnd(summary?.huyNoShow.tongTienPhatNoShow ?? 0)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-gray-900">
                    Online / Direct: <b>{summary?.datOnlineTrucTiep.online ?? 0}</b> / <b>{summary?.datOnlineTrucTiep.trucTiep ?? 0}</b>
                  </p>
                  <p className="text-gray-500 text-sm">Total: {summary?.datOnlineTrucTiep.tong ?? 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-gray-900">
                    Top utilization: <b>{summary?.tyLeSuDungTheoCoSo?.[0]?.tenCoSo ?? "N/A"}</b>
                  </p>
                  <p className="text-gray-500 text-sm">{summary?.tyLeSuDungTheoCoSo?.[0] ? `${(summary.tyLeSuDungTheoCoSo[0].tyLeSuDung * 100).toFixed(1)}%` : ""}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
