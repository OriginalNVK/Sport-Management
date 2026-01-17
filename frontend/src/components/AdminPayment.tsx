import { useState, useEffect } from 'react';
import { FileText, Plus, X, Check } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { invoiceService, type InvoiceResponse, type InvoiceDetailResponse } from '../services/InvoiceService';
import { bookingService, type UserBookingDto } from '../services/BookingService';

export function AdminPayment() {
  const [unpaidBookings, setUnpaidBookings] = useState<UserBookingDto[]>([]);
  const [allInvoices, setAllInvoices] = useState<InvoiceResponse[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  
  // Dialog state
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<UserBookingDto | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  
  // Update Invoice Dialog state
  const [isUpdateInvoiceOpen, setIsUpdateInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponse | null>(null);
  const [updateDiscountCode, setUpdateDiscountCode] = useState('');
  const [testRollback, setTestRollback] = useState(false);  // Demo rollback checkbox
  const [isUpdatingInvoice, setIsUpdatingInvoice] = useState(false);

  // View Detail Dialog state
  const [isViewDetailOpen, setIsViewDetailOpen] = useState(false);
  const [invoiceDetail, setInvoiceDetail] = useState<InvoiceDetailResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Fetch unpaid bookings
  useEffect(() => {
    fetchUnpaidBookings();
  }, []);

  // Fetch all invoices
  useEffect(() => {
    fetchAllInvoices();
  }, []);

  const fetchUnpaidBookings = async () => {
    try {
      setIsLoadingBookings(true);
      const token = localStorage.getItem('token');
      const bookings = await bookingService.getUnpaidBookings(token || undefined);
      setUnpaidBookings(bookings);
    } catch (error) {
      console.error('Error fetching unpaid bookings:', error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const fetchAllInvoices = async () => {
    try {
      setIsLoadingInvoices(true);
      const token = localStorage.getItem('token');
      const invoices = await invoiceService.getAllInvoices(token || undefined);
      setAllInvoices(invoices);
    } catch (error) {
      console.error('Error fetching all invoices:', error);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  const handleOpenCreateInvoice = (booking: UserBookingDto) => {
    setSelectedBooking(booking);
    setDiscountCode('');
    setIsCreateInvoiceOpen(true);
  };

  const handleCloseCreateInvoice = () => {
    setIsCreateInvoiceOpen(false);
    setSelectedBooking(null);
    setDiscountCode('');
  };

  const handleConfirmCreateInvoice = async () => {
    if (!selectedBooking) return;

    try {
      setIsCreatingInvoice(true);
      
      // Trim và uppercase mã giảm giá
      const trimmedCode = discountCode.trim().toUpperCase();
      
      await invoiceService.createInvoice({
        maPhieu: selectedBooking.maPhieu,
        maGiamGia: trimmedCode || null,
        phanTramThue: 10.0
      });

      alert('Tạo hóa đơn thành công!');
      handleCloseCreateInvoice();
      
      // Refresh data
      fetchUnpaidBookings();
      fetchAllInvoices();
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Lỗi khi tạo hóa đơn: ' + (error as Error).message);
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const handleOpenUpdateInvoice = (invoice: InvoiceResponse) => {
    setSelectedInvoice(invoice);
    setUpdateDiscountCode('');
    setIsUpdateInvoiceOpen(true);
  };

  const handleCloseUpdateInvoice = () => {
    setIsUpdateInvoiceOpen(false);
    setSelectedInvoice(null);
    setUpdateDiscountCode('');
    setTestRollback(false);  // Reset checkbox
  };

  const handleConfirmUpdateInvoice = async () => {
    if (!selectedInvoice) return;

    try {
      setIsUpdatingInvoice(true);
      
      // Trim và chuyển thành null nếu rỗng
      const discountCode = updateDiscountCode.trim();
      
      await invoiceService.updateInvoice(selectedInvoice.maHd, {
        maGiamGia: discountCode || null,
        testRollback: testRollback
      });

      if (testRollback) {
        // Nếu test rollback, hiện warning message
        alert('ROLLBACK: Transaction đã được rollback sau 10 giây!');
      } else {
        alert('Cập nhật hóa đơn thành công!');
      }
      
      handleCloseUpdateInvoice();
      
      // Refresh data
      fetchAllInvoices();
    } catch (error) {
      console.error('Error updating invoice:', error);
      
      // Nếu là rollback demo, hiện message đặc biệt
      if (testRollback) {
        alert('DEMO ROLLBACK HOÀN TẤT!\n\n' + (error as Error).message);
        handleCloseUpdateInvoice();
        fetchAllInvoices();
      } else {
        alert('Lỗi khi cập nhật hóa đơn: ' + (error as Error).message);
      }
    } finally {
      setIsUpdatingInvoice(false);
    }
  };

  const handleViewDetail = async (invoice: InvoiceResponse) => {
    try {
      setIsLoadingDetail(true);
      setIsViewDetailOpen(true);
      setInvoiceDetail(null);
      
      const detail = await invoiceService.getInvoiceDetail(invoice.maHd);
      setInvoiceDetail(detail);
    } catch (error) {
      console.error('Error fetching invoice detail:', error);
      alert('Lỗi khi xem chi tiết hóa đơn: ' + (error as Error).message);
      setIsViewDetailOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseViewDetail = () => {
    setIsViewDetailOpen(false);
    setInvoiceDetail(null);
  };

  const getPaymentStatusBadge = (tinhTrangTt?: string) => {
    if (tinhTrangTt === 'da_tt') {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <Check className="w-3 h-3 mr-1" />
          Complete
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
        Pending
      </Badge>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-800">Payment Management</h1>
        <p className="text-gray-600 mt-2">Manage invoices and payments</p>
      </div>

      <Tabs defaultValue="unpaid" className="w-full">
        <TabsList className="grid w-full grid-cols-2 border-1 border-black">
          <TabsTrigger 
            value="unpaid" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Booking Unpaid
          </TabsTrigger>
          <TabsTrigger 
            value="invoices" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Invoices
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Booking Unpaid */}
        <TabsContent value="unpaid" className="space-y-4">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {isLoadingBookings ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading bookings...</span>
                </div>
              ) : unpaidBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No unpaid bookings found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm text-gray-700">Booking ID</th>
                        <th className="px-6 py-3 text-left text-sm text-gray-700">Booking Date</th>
                        <th className="px-6 py-3 text-left text-sm text-gray-700">Time</th>
                        <th className="px-6 py-3 text-left text-sm text-gray-700">Total Amount</th>
                        <th className="px-6 py-3 text-left text-sm text-gray-700">Status</th>
                        <th className="px-6 py-3 text-left text-sm text-gray-700">Services</th>
                        <th className="px-6 py-3 text-left text-sm text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {unpaidBookings.map((booking) => (
                        <tr key={booking.maPhieu} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                              BK-{booking.maPhieu}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            {booking.ngayDat}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {booking.gioBatDau} - {booking.gioKetThuc}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-lg font-semibold text-gray-900">
                              ${booking.tongTien?.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={
                              booking.trangThai === 'da_xac_nhan' 
                                ? 'bg-green-100 text-green-700 border-green-200' 
                                : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            }>
                              {booking.trangThai}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {booking.danhSachDichVu || 'No services'}
                          </td>
                          <td className="px-6 py-4">
                            <Button 
                              onClick={() => handleOpenCreateInvoice(booking)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              size="sm"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Create Invoice
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: All Invoices */}
        <TabsContent value="invoices" className="space-y-4">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {isLoadingInvoices ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading invoices...</span>
                </div>
              ) : allInvoices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No invoices found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm text-gray-700">Invoice ID</th>
                        <th className="px-6 py-3 text-left text-sm text-gray-700">Booking ID</th>
                        <th className="px-6 py-3 text-left text-sm text-gray-700">Customer</th>
                        <th className="px-6 py-3 text-left text-sm text-gray-700">Field</th>
                        <th className="px-6 py-3 text-left text-sm text-gray-700">Booking Date</th>
                        <th className="px-6 py-3 text-left text-sm text-gray-700">Time</th>
                        <th className="px-6 py-3 text-left text-sm text-gray-700">Invoice Date</th>
                        <th className="px-6 py-3 text-left text-sm text-gray-700">Total</th>
                        <th className="px-6 py-3 text-left text-sm text-gray-700">Payment Status</th>
                        <th className="px-6 py-3 text-left text-sm text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allInvoices.map((invoice) => (
                        <tr key={invoice.maHd} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm font-medium">
                              INV-{invoice.maHd}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                              BK-{invoice.maPhieu}
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
                            {getPaymentStatusBadge(invoice.tinhTrangTt)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleViewDetail(invoice)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                size="sm"
                              >
                                View Detail
                              </Button>
                              <Button 
                                onClick={() => handleOpenUpdateInvoice(invoice)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                size="sm"
                              >
                                Update
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              {/* Booking Details */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-700 mb-3">Booking Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Booking ID:</span>
                    <p className="font-medium">BK-{selectedBooking.maPhieu}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <p className="font-medium">{selectedBooking.ngayDat}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <p className="font-medium">
                      {selectedBooking.gioBatDau} - {selectedBooking.gioKetThuc}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <p className="font-medium text-blue-600">
                      ${selectedBooking.tongTien?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Discount Code Input */}
              <div className="space-y-2">
                <Label htmlFor="discountCode" className="flex items-center gap-2">
                  Mã giảm giá (Không bắt buộc)
                </Label>
                <Input
                  id="discountCode"
                  placeholder="VD: SLV5, GOLD10, VIP20"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  className="font-mono"
                />
                {discountCode && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-xs text-green-700 font-medium">
                      📋 Mã sẽ được áp dụng: {discountCode.trim().toUpperCase()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseCreateInvoice}
              disabled={isCreatingInvoice}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCreateInvoice}
              disabled={isCreatingInvoice}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCreatingInvoice ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirm
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Invoice Dialog */}
      <Dialog open={isUpdateInvoiceOpen} onOpenChange={setIsUpdateInvoiceOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>Update Invoice</DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-4">
              {/* Invoice Details */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-gray-700 mb-3">Invoice Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Invoice ID:</span>
                    <p className="font-medium">INV-{selectedInvoice.maHd}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Booking ID:</span>
                    <p className="font-medium">BK-{selectedInvoice.maPhieu}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Customer:</span>
                    <p className="font-medium">{selectedInvoice.tenKhachHang || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <p className="font-medium text-purple-600">
                      ${selectedInvoice.tongCuoi.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Discount:</span>
                    <p className="font-medium text-green-600">
                      ${selectedInvoice.giamGia.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment Status:</span>
                    <p className="font-medium">
                      {selectedInvoice.tinhTrangTt === 'da_tt' ? 'Paid' : 'Unpaid'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Discount Code Input */}
              <div className="space-y-2">
                <Label htmlFor="updateDiscountCode">New Discount Code</Label>
                <Input
                  id="updateDiscountCode"
                  placeholder="Enter new discount code (e.g., SLV5)"
                  value={updateDiscountCode}
                  onChange={(e) => setUpdateDiscountCode(e.target.value.toUpperCase())}
                />
                <p className="text-xs text-gray-500">
                  Leave empty to keep current discount or update with a new code
                </p>
              </div>

              {/* Test Rollback Checkbox (Demo only) */}
              <div className="flex items-center space-x-2 bg-red-50 p-3 rounded-lg border border-red-200">
                <input
                  type="checkbox"
                  id="testRollback"
                  checked={testRollback}
                  onChange={(e) => setTestRollback(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <label htmlFor="testRollback" className="text-sm font-medium text-red-700 cursor-pointer flex-1">
                  ⚠️ Demo Rollback (Dirty Read Test)
                </label>
                <p className="text-xs text-red-600">
                  If checked, transaction will rollback after 10s
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseUpdateInvoice}
              disabled={isUpdatingInvoice}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleConfirmUpdateInvoice}
              disabled={isUpdatingInvoice}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isUpdatingInvoice ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {testRollback ? 'Rolling back...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {testRollback ? 'Update & Rollback' : 'Update'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Detail Dialog */}
      <Dialog open={isViewDetailOpen} onOpenChange={setIsViewDetailOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Invoice Detail (REPEATABLE READ)</DialogTitle>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading invoice detail...</span>
            </div>
          ) : invoiceDetail ? (
            <div className="space-y-6">
              {/* Invoice Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Invoice Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Invoice ID</p>
                    <p className="font-medium text-gray-900">INV-{invoiceDetail.maHd}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Booking ID</p>
                    <p className="font-medium text-gray-900">BK-{invoiceDetail.maPhieu}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Invoice Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(invoiceDetail.ngayLap).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className="font-medium text-gray-900">
                      {getPaymentStatusBadge(invoiceDetail.tinhTrangTt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer & Field Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-3">Customer & Field</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Customer Name</p>
                    <p className="font-medium text-gray-900">{invoiceDetail.tenKhachHang || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Field Name</p>
                    <p className="font-medium text-gray-900">{invoiceDetail.tenSan || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">Price Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-medium text-gray-900">
                      ${invoiceDetail.tongTien.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-green-600">
                    <span>Discount:</span>
                    <span className="font-medium">
                      -${invoiceDetail.giamGia.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-orange-600">
                    <span>Tax:</span>
                    <span className="font-medium">
                      +${invoiceDetail.thue.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t-2 border-purple-200 pt-3 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-purple-700">
                      ${invoiceDetail.tongCuoi.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No invoice detail available
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseViewDetail}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
