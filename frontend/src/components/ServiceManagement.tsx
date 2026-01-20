import { useEffect, useMemo, useState } from 'react';
import { Wrench, Plus, Edit, Trash2, Dumbbell, Users, Shirt, Camera, Coffee, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { UserRole } from '../App';
import type { PageType } from '../App';
import { bookingExtraService, type ServiceInfoResponse } from '../services/BookingExtraService';
import { invoiceService, type InvoiceResponse } from '../services/InvoiceService';
import { getBookingsByCustomer} from '../services/BookingService';


const categories = ['All', 'bong', 'trang_phuc', 'do_uong', 'huan_luyen_vien'];

const categoryColors: Record<string, string> = {
  bong: 'bg-blue-100 text-blue-700 border-blue-200',
  trang_phuc: 'bg-green-100 text-green-700 border-green-200',
  // Coach: 'bg-purple-100 text-purple-700 border-purple-200',
  do_uong: 'bg-orange-100 text-orange-700 border-orange-200',
  huan_luyen_vien: 'bg-red-100 text-red-700 border-red-200',
};

const unitList = {
  'cai': 'Cái',
  'bo': 'Bộ',
  'chai': 'Chai',
  'gio': 'Giờ',
};

interface ServiceManagementProps {
  userRole: UserRole;
  onNavigate: (page: PageType) => void;
}

export function ServiceManagement({ userRole, onNavigate }: ServiceManagementProps) {
  const [filter, setFilter] = useState('All');

  // data từ API
  const [services, setServices] = useState<ServiceInfoResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    // 🔹 số lượng theo từng dịch vụ (key = maDv)
  const [qtyByService, setQtyByService] = useState<Record<number, number>>({});

  // 🔹 đang submit booking cho service nào
  // const [bookingId, setBookingId] = useState<number | null>(null);

  // 🔹 lấy số lượng (mặc định = 1)
  const getQty = (maDv: number) => qtyByService[maDv] ?? 0;

  // 🔹 set số lượng cho 1 dịch vụ
  const setQty = (maDv: number, qty: number) => {
    setQtyByService((prev) => ({
      ...prev,
      [maDv]: qty,
    }));
  };
// 🔹 danh sách dịch vụ đã chọn (soLuong > 0)
const selectedItems = useMemo(() => {
  return services
    .map((s) => ({
      maDv: s.maDv,
      tenDv: s.tenDv ?? '',
      donGia: s.donGia,
      soLuong: getQty(s.maDv),
    }))
    .filter((x) => x.soLuong > 0);
}, [services, qtyByService]);

  const [bookings, setBookings] = useState<InvoiceResponse[]>([]);
  const [selectedPhieuId, setSelectedPhieuId] = useState<number | ''>('');
  const [batchLoading, setBatchLoading] = useState(false);

  const [selectedMaSan, setSelectedMaSan] = useState<number | null>(null);

  const handleSelectPhieu = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const maPhieu = Number(e.target.value);
    setSelectedPhieuId(maPhieu);

    const found = bookings.find(b => b.maPhieu === maPhieu);
    setSelectedMaSan(found?.maSan ?? null);
  };


  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, count } = await bookingExtraService.getServiceList(
          selectedMaSan ?? 1
        );

        if (mounted) setServices(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Không tải được dịch vụ');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedMaSan]); // ✅ QUAN TRỌNG


  useEffect(() => {
  if (userRole !== 'customer') return;

  const maKh = Number(JSON.parse(localStorage.getItem('user_data'))?.maKh); // ✅ bạn thay đúng nguồn lấy maKh
  if (!maKh) return;

  (async () => {
    try {
      const res = await getBookingsByCustomer(maKh);
      const list = Array.isArray(res) ? res : (res as any)?.data ?? [];
       // 👉 Lấy ngày hiện tại (00:00:00)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 👉 Lọc + sort
      const filteredAndSorted = list
        .filter((b) => {
          if (!b.ngayDat) return false;
          const bookingDate = new Date(b.ngayDat);
          bookingDate.setHours(0, 0, 0, 0);
          return bookingDate > today;
        })
        .sort((a, b) => {
          const da = new Date(`${a.ngayDat}T${a.gioBatDau ?? '00:00'}`);
          const db = new Date(`${b.ngayDat}T${b.gioBatDau ?? '00:00'}`);
          return da.getTime() - db.getTime(); // ASC
        });

      setBookings(filteredAndSorted);

      if (list.length > 0) setSelectedPhieuId(list[0].maPhieu);
    } catch (e) {
      console.error(e);
      console.log("Axios error detail:", {
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data,
        url: e?.config?.url,
      });
    }
  })();
}, [userRole]);

 console.log('bookings',  bookings);
//  console.log('makh',  localStorage.getItem('maKh'));
  const filteredServices = filter === 'All' 
    ? services 
    : services.filter(s => s.loaiDv === filter);
  // console.log('filteredServices', filteredServices);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-gray-800 mb-4">Loading services...</h1>
        <p className="text-gray-600">Vui lòng đợi một chút.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-gray-800 mb-4">Không tải được dịch vụ</h1>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Thử lại</Button>
      </div>
    );
  }

  // const handleBooking = () => {
  //   onNavigate('payment');
  // };
  const handleBookAllServices = async () => {
  if (!selectedPhieuId) {
    alert('Vui lòng chọn phiếu đặt sân');
    return;
  }

  if (selectedItems.length === 0) {
    alert('Vui lòng nhập số lượng ít nhất 1 dịch vụ');
    return;
  }
  
  const loadServices = async () => {
    setLoading(true);
    const { data } = await bookingExtraService.getServiceList(selectedMaSan ?? 1);
    setServices(data);
    setLoading(false);
  };


  try {
    setBatchLoading(true);

    await bookingExtraService.addManyServicesToPhieu({
      ma_phieu: Number(selectedPhieuId),
      items: selectedItems.map((it) => ({
        ma_dv: it.maDv,
        so_luong: it.soLuong,
      })),
    });

    // (tuỳ bạn) reset lại số lượng về 0 sau khi add thành công
    setQtyByService({});

    // chuyển trang payment
    // onNavigate('payment');
    await loadServices();
  } catch (e: any) {
    alert(e?.message || 'Thêm dịch vụ thất bại');
    await loadServices();
  } finally {
    setBatchLoading(false);
  }
};


  // Customer View - Available Services
  if (userRole === 'customer') {
    return (
      <div className="p-8">
        {/* <h1 className="mb-8 text-gray-800">Available Services</h1> */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
  <div className="flex items-center gap-2">
    <span className="text-gray-600">Chọn phiếu đặt:</span>

    <select
      value={selectedPhieuId}
      // onChange={(e) => setSelectedPhieuId(Number(e.target.value))}
      onChange={handleSelectPhieu}
      className="border border-gray-300 rounded-md px-3 py-2 bg-white"
    >
      {bookings.length === 0 && <option value="">(Chưa có phiếu đặt sân)</option>}
      {bookings.map((inv) => (
        <option key={inv.maPhieu} value={inv.maPhieu}>
          # - Phiếu {inv.maPhieu} - Sân {inv.maSan} - Ngày {inv.ngayDat} - Giờ bắt đầu: {inv.gioBatDau} - Giờ kết thúc: {inv.gioKetThuc} - Trạng thái: {inv.tinhTrangTt === 'chua_tt' ? 'Chưa thanh toán' : inv.tinhTrangTt === 'da_tt' ? 'Đã thanh toán' : 'Hoàn tiền'}
        </option>
      ))}
    </select>
  </div>

  {/* <div className="ml-auto text-gray-700">
    Đã chọn: <b>{selectedItems.length}</b> dịch vụ • Tổng thêm: <b>{totalExtra}</b>
  </div> */}
</div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            // const Icon = service.icon!;
            const Icon = Wrench;
            if (service.trangThai !== 'hoat_dong') {return null;}
            return (
              <div
                key={service.maDv}
                className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-gray-900">{service.tenDv}</h3>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm ${
                        service.trangThai === 'hoat_dong'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {service.trangThai === 'hoat_dong' ? 'Hoạt động' : 'Ngừng hoạt động'}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{service.tenDv}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Giá:</span>
                    <span className="text-xl text-gray-900">{service.donGia}₫</span>
                  </div>
                  {/* <div className="flex justify-between items-center">
                    <span className="text-gray-600">Đơn vị:</span>
                    <span className="text-gray-900">{unitList[service.donVi ?? 'cai']}</span>
                  </div> */}
                  <div className="flex justify-between items-center">
      <span className="text-gray-600">Số lượng còn:</span>
      <span className="text-xl text-gray-900">{service.soLuongTon} 
        <span className="text-gray-600 ml-2">
      {unitList[service.donVi ?? 'Cái']}
    </span></span>
      
    </div>
                  <div className="flex justify-between items-center">
  <span className="text-gray-600">Số lượng thuê:</span>

  <div className="flex items-center gap-2">
    {/* input số lượng */}
    {/* <input
      type="number"
      min={1}
      value={getQty(service.maDv)}
      onChange={(e) =>
        setQty(service.maDv, Math.max(1, Number(e.target.value)))
      }
      className="w-20 border border-gray-300 rounded-md px-2 py-1 text-right"
    /> */}
    <input
  type="number"
  min={0}
  value={getQty(service.maDv)}
  onChange={(e) => {
    const v = Number(e.target.value);
    setQty(service.maDv, Number.isFinite(v) ? Math.max(0, v) : 0);
  }}
  className="w-20 border border-gray-300 rounded-md px-2 py-1 text-right"
/>

  </div>

</div>
                </div>

                {/* <button
                  onClick={handleBooking}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Book Service
                </button> */}
              </div>
            );
          })}
        </div>
          <div className="mt-6 flex justify-end">
  <button
    onClick={handleBookAllServices}
    disabled={batchLoading || !selectedPhieuId || selectedItems.length === 0}
    className={`px-6 py-3 rounded-lg text-white transition-colors ${
      batchLoading || !selectedPhieuId || selectedItems.length === 0
        ? 'bg-blue-400 cursor-not-allowed'
        : 'bg-blue-600 hover:bg-blue-700'
    }`}
  >
    {batchLoading ? 'Booking...' : 'Book Services'}
  </button>
</div>
      </div>
    );
  }

  // Manager View - Service Management
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-800">Service Management</h1>
        <p className="text-gray-600 mt-2">Manage additional services and amenities</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Services</p>
                <p className="text-gray-900 mt-1">{services.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Services</p>
                <p className="text-gray-900 mt-1">{services.filter(service => service.trangThai === 'hoat_dong').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <Wrench className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Bookings</p>
                <p className="text-gray-900 mt-1">604</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                <Wrench className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Revenue</p>
                <p className="text-gray-900 mt-1">$68,420</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <Wrench className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Add Button */}
      <div className="flex flex-wrap gap-3 mb-6">
        {categories.map((category) => (
          <Button
            key={category}
            variant={filter === category ? 'default' : 'outline'}
            onClick={() => setFilter(category)}
            className={filter === category ? 'bg-blue-600 hover:bg-blue-700' : ''}
            size="sm"
          >
            {category}
          </Button>
        ))}
        <Button className="ml-auto bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredServices.map((service) => (
          <Card key={service.maDv} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Wrench className="w-6 h-6 text-blue-600" />
                </div>
                <Badge className={service.trangThai === 'hoat_dong' 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-200'
                }>
                  {service.trangThai === 'hoat_dong' ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
              <CardTitle className="text-lg">{service.tenDv}</CardTitle>
              <Badge className={categoryColors[service.loaiDv ?? '']}>
                {service.loaiDv}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">{service.tenDv}</p>
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-gray-900">${service.donGia}</p>
                </div>
                {/* <div className="text-right">
                  <p className="text-sm text-gray-600">Bookings</p>
                  <p className="text-gray-900">{service.bookings}</p>
                </div> */}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    
  );
}