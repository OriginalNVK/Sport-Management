import { useState, useEffect } from 'react';
import { FileText, Plus, Calendar, Loader2, X, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import LeaveService, { type LeaveRequestDto, type CreateLeaveRequest } from '../services/LeaveService';

export function MyLeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState<CreateLeaveRequest>({
    maNv: 0,
    ngayNghi: '',
    lyDo: '',
  });

  // Lấy mã nhân viên từ localStorage
  const getCurrentEmployeeId = (): number => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.maNv) {
          return user.maNv;
        }
        console.error('maNv not found in user_data:', user);
        return 0;
      } catch (error) {
        console.error('Error parsing user_data:', error);
        return 0;
      }
    }
    console.error('user_data not found in localStorage');
    return 0;
  };

  useEffect(() => {
    loadMyLeaveRequests();
  }, []);

  const loadMyLeaveRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const maNv = getCurrentEmployeeId();
      if (maNv === 0) {
        setError('Không tìm thấy thông tin nhân viên. Vui lòng đăng xuất và đăng nhập lại.');
        return;
      }
      const data = await LeaveService.getLeaveRequestsByEmployee(maNv);
      setLeaveRequests(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đơn nghỉ phép');
      console.error('Error loading leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    const maNv = getCurrentEmployeeId();
    setFormData({
      maNv,
      ngayNghi: '',
      lyDo: '',
    });
    setShowCreateDialog(true);
  };

  const closeDialog = () => {
    setShowCreateDialog(false);
  };

  const handleCreateLeaveRequest = async () => {
    try {
      if (!formData.ngayNghi) {
        alert('Vui lòng chọn ngày nghỉ');
        return;
      }
      if (!formData.lyDo.trim()) {
        alert('Vui lòng nhập lý do nghỉ');
        return;
      }

      await LeaveService.createLeaveRequest(formData);
      closeDialog();
      await loadMyLeaveRequests();
      alert('Tạo đơn nghỉ phép thành công!');
    } catch (err: any) {
      alert(err.message || 'Không thể tạo đơn nghỉ phép');
    }
  };

  const handleCancelRequest = async (maDon: number) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn nghỉ phép này?')) return;
    
    try {
      await LeaveService.deleteLeaveRequest(maDon);
      await loadMyLeaveRequests();
      alert('Đã hủy đơn nghỉ phép');
    } catch (err: any) {
      alert(err.message || 'Không thể hủy đơn nghỉ phép');
    }
  };

  const getStatusBadge = (trangThai?: string) => {
    const statusMap = {
      cho_duyet: { label: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      da_duyet: { label: 'Đã duyệt', class: 'bg-green-100 text-green-700 border-green-200' },
      tu_choi: { label: 'Từ chối', class: 'bg-red-100 text-red-700 border-red-200' },
    };
    const status = statusMap[trangThai as keyof typeof statusMap] || statusMap.cho_duyet;
    return { label: status.label, className: status.class };
  };

  const pendingCount = leaveRequests.filter(r => r.trangThai === 'cho_duyet').length;
  const approvedCount = leaveRequests.filter(r => r.trangThai === 'da_duyet').length;
  const rejectedCount = leaveRequests.filter(r => r.trangThai === 'tu_choi').length;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">Lỗi</p>
          </div>
          <p className="text-sm mt-1">{error}</p>
          <Button onClick={loadMyLeaveRequests} className="mt-3 bg-red-600 hover:bg-red-700">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-800">Đơn nghỉ phép của tôi</h1>
        <p className="text-gray-600 mt-2">Quản lý và tạo mới đơn xin nghỉ phép</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng đơn</p>
                <p className="text-gray-900 mt-1">{leaveRequests.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Chờ duyệt</p>
                <p className="text-gray-900 mt-1">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Đã duyệt</p>
                <p className="text-gray-900 mt-1">{approvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Từ chối</p>
                <p className="text-gray-900 mt-1">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="shadow-sm mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-700">Tạo đơn xin nghỉ phép mới</p>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo đơn mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests List */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Danh sách đơn nghỉ phép</CardTitle>
        </CardHeader>
        <CardContent>
          {leaveRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Chưa có đơn nghỉ phép nào</p>
              <p className="text-sm mt-2">Nhấn "Tạo đơn mới" để tạo đơn xin nghỉ phép</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaveRequests.map((request) => {
                const status = getStatusBadge(request.trangThai);
                return (
                  <div
                    key={request.maDon}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">
                            Đơn nghỉ ngày {new Date(request.ngayNghi).toLocaleDateString('vi-VN')}
                          </h3>
                          <Badge className={status.className}>
                            {status.label}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <span className="font-medium">Mã đơn:</span> #{request.maDon}
                          </p>
                          <p>
                            <span className="font-medium">Lý do:</span> {request.lyDo || 'Không có'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {request.trangThai === 'cho_duyet' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleCancelRequest(request.maDon)}
                          >
                            Hủy đơn
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Leave Request Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-white bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Tạo đơn nghỉ phép mới</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeDialog}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày nghỉ <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.ngayNghi}
                  onChange={(e) => setFormData(prev => ({ ...prev, ngayNghi: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do nghỉ <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  value={formData.lyDo}
                  onChange={(e) => setFormData(prev => ({ ...prev, lyDo: e.target.value }))}
                  placeholder="Nhập lý do xin nghỉ phép..."
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.lyDo.length}/1000 ký tự
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={closeDialog}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleCreateLeaveRequest}
                >
                  Tạo đơn
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
