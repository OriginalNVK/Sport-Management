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
  const [taxRate, setTaxRate] = useState(10);
  const [discountCodes, setDiscountCodes] = useState('');
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
      console.log('Tax rate:', taxRate);
      console.log('Discount codes:', discountCodes);
      
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
          <TabsList className="grid w-full grid-cols-2 mb-8">
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
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Tax Rate (%)
                        </label>
                        <input
                          type="number"
                          value={taxRate}
                          onChange={(e) => setTaxRate(Number(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Hiển thị thông tin booking đã chọn */}
                    {selectedBooking && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-gray-700 mb-3">Booking Details</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Ngày đặt:</span>
                            <p className="font-medium">{selectedBooking.ngayDat}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Thời gian:</span>
                            <p className="font-medium">
                              {selectedBooking.gioBatDau} - {selectedBooking.gioKetThuc}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Tổng tiền:</span>
                            <p className="font-medium text-blue-600">
                              ${selectedBooking.tongTien?.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Trạng thái:</span>
                            <Badge className={`${
                              selectedBooking.trangThai === 'da_xac_nhan' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {selectedBooking.trangThai}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Discount Codes (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter discount codes separated by comma"
                        value={discountCodes}
                        onChange={(e) => setDiscountCodes(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
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

  // Manager View - Payment Management
  const transactions = [
    { id: 'TXN-001', user: 'John Doe', service: 'Football Field A', amount: 120, method: 'Credit Card', status: 'Completed', date: '2024-01-15' },
    { id: 'TXN-002', user: 'Jane Smith', service: 'Basketball Court', amount: 80, method: 'PayPal', status: 'Pending', date: '2024-01-14' },
    { id: 'TXN-003', user: 'Bob Johnson', service: 'Tennis Court', amount: 150, method: 'Debit Card', status: 'Completed', date: '2024-01-13' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-800">Payment Management</h1>
        <p className="text-gray-600 mt-2">Track and manage all payment transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-gray-900 mt-1">$124,500</p>
                <p className="text-green-600 text-sm mt-1">+18.7% from last month</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-gray-900 mt-1">$118,200</p>
                <p className="text-gray-600 text-sm mt-1">95% success rate</p>
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
                <p className="text-gray-900 mt-1">$4,800</p>
                <p className="text-gray-600 text-sm mt-1">12 transactions</p>
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
                <p className="text-gray-600 text-sm">Failed</p>
                <p className="text-gray-900 mt-1">$1,500</p>
                <p className="text-gray-600 text-sm mt-1">5 transactions</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { method: 'Credit Card', percentage: 65, color: 'bg-blue-500' },
                { method: 'PayPal', percentage: 25, color: 'bg-purple-500' },
                { method: 'Debit Card', percentage: 10, color: 'bg-green-500' },
              ].map((item) => (
                <div key={item.method}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{item.method}</span>
                    <span className="text-sm text-gray-900">{item.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">Avg Transaction</p>
                <p className="text-blue-900 mt-1">$156.50</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">Today's Revenue</p>
                <p className="text-green-900 mt-1">$8,450</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700">Total Transactions</p>
                <p className="text-purple-900 mt-1">1,247</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-700">This Month</p>
                <p className="text-orange-900 mt-1">$24,500</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Button variant="outline">Export Report</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-gray-600">Transaction ID</th>
                  <th className="text-left py-4 px-4 text-gray-600">User</th>
                  <th className="text-left py-4 px-4 text-gray-600">Service</th>
                  <th className="text-left py-4 px-4 text-gray-600">Amount</th>
                  <th className="text-left py-4 px-4 text-gray-600">Method</th>
                  <th className="text-left py-4 px-4 text-gray-600">Status</th>
                  <th className="text-left py-4 px-4 text-gray-600">Date</th>
                  <th className="text-left py-4 px-4 text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="text-blue-600">{transaction.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm">
                          {transaction.user.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-gray-900">{transaction.user}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">{transaction.service}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">${transaction.amount}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-600">{transaction.method}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusBadge(transaction.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(transaction.status)}
                          {transaction.status}
                        </div>
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600 text-sm">{transaction.date}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}