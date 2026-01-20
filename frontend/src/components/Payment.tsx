import { CreditCard, DollarSign, TrendingUp, CheckCircle, Clock, XCircle, Plus, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { UserRole } from '../App';
import { useEffect, useState } from 'react';
import { getMyBookings, type UserBookingDto } from '../services/BookingService';
import { invoiceService, type InvoiceResponse } from '../services/InvoiceService';

interface PaymentProps {
  userRole: UserRole;
}

export function Payment({ userRole }: PaymentProps) {
  const [myBookings, setMyBookings] = useState<UserBookingDto[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<UserBookingDto | null>(null);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [paidInvoices, setPaidInvoices] = useState<InvoiceResponse[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

  // Fetch user's bookings
  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        setIsLoadingBookings(true);
        const token = localStorage.getItem('token');
        const response = await getMyBookings(token || undefined);
        
        if (response.success && response.data) {
          setMyBookings(response.data);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoadingBookings(false);
      }
    };

    if (userRole === 'customer') {
      fetchMyBookings();
    }
  }, [userRole]);

  // Fetch paid invoices
  useEffect(() => {
    const fetchPaidInvoices = async () => {
      try {
        setIsLoadingInvoices(true);
        const invoices = await invoiceService.getPaidInvoices();
        setPaidInvoices(invoices);
      } catch (error) {
        console.error('Error fetching paid invoices:', error);
      } finally {
        setIsLoadingInvoices(false);
      }
    };

    if (userRole === 'customer') {
      fetchPaidInvoices();
    }
  }, [userRole]);

  const handleBookingChange = (maPhieu: number) => {
    const booking = myBookings.find(b => b.maPhieu === maPhieu);
    setSelectedBooking(booking || null);
  };

  const handleCreateInvoice = async () => {
    if (!selectedBooking) {
      alert('Vui lòng chọn booking');
      return;
    }

    try {
      // TODO: Call POST /invoices endpoint here
      console.log('Creating invoice for booking:', selectedBooking);
      
      alert('Tạo invoice thành công!');
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Lỗi khi tạo invoice');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  // Customer View - Customer Payment History
  if (userRole === 'customer') {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-gray-800">My Payments</h1>
          <p className="text-gray-600 mt-2">Manage your invoices and payment history</p>
        </div>

        <Tabs defaultValue="invoices" className="w-full">
          <TabsList className="grid w-full grid-cols-2 border-1 border-black">
            <TabsTrigger 
              value="invoices" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Invoices
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <CreditCard className="w-4 h-4" />
              Payment History
            </TabsTrigger>
          </TabsList>

          {/* Tab Invoices */}
          <TabsContent value="invoices" className="space-y-8">
            {/* Create Invoice Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Plus className="w-6 h-6 text-blue-600" />
                  <h2 className="text-gray-700">Create New Invoice</h2>
                </div>
              </div>
              <Card className="shadow-sm border-2 border-blue-100">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Select Booking
                        </label>
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onChange={(e) => handleBookingChange(Number(e.target.value))}
                          disabled={isLoadingBookings}
                        >
                          <option value="">
                            {isLoadingBookings ? 'Loading bookings...' : 'Select a booking'}
                          </option>
                          {myBookings.map((booking) => (
                            <option key={booking.maPhieu} value={booking.maPhieu}>
                              {booking.displayText}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Hiển thị thông tin booking đã chọn */}
                    {selectedBooking && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-gray-700 mb-3">Booking Details</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Booking Date:</span>
                            <p className="font-medium">{selectedBooking.ngayDat}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Time:</span>
                            <p className="font-medium">
                              {selectedBooking.gioBatDau} - {selectedBooking.gioKetThuc}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Amount:</span>
                            <p className="font-medium text-blue-600">
                              ${selectedBooking.tongTien?.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <Badge className={`${
                              selectedBooking.trangThai === 'da_xac_nhan' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {selectedBooking.trangThai}
                            </Badge>
                          </div>
                          {selectedBooking.danhSachDichVu && (
                            <div className="col-span-2">
                              <span className="text-gray-600">Services:</span>
                              <p className="font-medium text-green-600 mt-1">
                                {selectedBooking.danhSachDichVu}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleCreateInvoice}
                        disabled={!selectedBooking}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Invoice
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Tab Payment History */}
          <TabsContent value="history" className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h2 className="text-gray-700">Payment History</h2>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {paidInvoices.length} paid
                </Badge>
              </div>
              <Card className="shadow-sm">
                <CardContent className="p-0">
                  {isLoadingInvoices ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Loading invoices...</span>
                    </div>
                  ) : paidInvoices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No payment history found
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm text-gray-700">Invoice ID</th>
                            <th className="px-6 py-3 text-left text-sm text-gray-700">Customer</th>
                            <th className="px-6 py-3 text-left text-sm text-gray-700">Field</th>
                            <th className="px-6 py-3 text-left text-sm text-gray-700">Booking Date</th>
                            <th className="px-6 py-3 text-left text-sm text-gray-700">Time</th>
                            <th className="px-6 py-3 text-left text-sm text-gray-700">Invoice Date</th>
                            <th className="px-6 py-3 text-left text-sm text-gray-700">Total</th>
                            <th className="px-6 py-3 text-left text-sm text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paidInvoices.map((invoice) => (
                            <tr key={invoice.maHd} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                                  INV-{invoice.maHd}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-900">
                                {invoice.tenKhachHang || 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-gray-900">
                                {invoice.tenSan || 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {invoice.ngayDat || 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {invoice.gioBatDau && invoice.gioKetThuc 
                                  ? `${invoice.gioBatDau} - ${invoice.gioKetThuc}`
                                  : 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {new Date(invoice.ngayLap).toLocaleDateString('vi-VN')}
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-lg font-semibold text-gray-900">
                                  ${invoice.tongCuoi.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Paid
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Summary */}
              {paidInvoices.length > 0 && (
                <Card className="mt-4 shadow-sm bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="text-gray-600">Total Paid</p>
                          <p className="text-2xl text-gray-900">
                            ${paidInvoices.reduce((sum, p) => sum + p.tongCuoi, 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="text-gray-600">Total Transactions</p>
                          <p className="text-2xl text-gray-900">{paidInvoices.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                        <div>
                          <p className="text-gray-600">Average Payment</p>
                          <p className="text-2xl text-gray-900">
                            ${Math.round(paidInvoices.reduce((sum, p) => sum + p.tongCuoi, 0) / paidInvoices.length).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
}