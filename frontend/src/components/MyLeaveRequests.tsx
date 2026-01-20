import { useState, useEffect } from 'react';
import { FileText, Plus, Calendar, Loader2, X, AlertCircle, Clock, Send, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import LeaveService, { type LeaveRequestDto, type CreateLeaveRequest } from '../services/LeaveService';

export function MyLeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitMessage, setSubmitMessage] = useState('');
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
    setSubmitting(false);
    setSubmitProgress(0);
    setSubmitMessage('');
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

      setSubmitting(true);
      setSubmitProgress(0);
      setSubmitMessage('Đang gửi đơn nghỉ phép...');

      // Simulate progress animation
      const progressInterval = setInterval(() => {
        setSubmitProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      await LeaveService.createLeaveRequest(formData);
      
      clearInterval(progressInterval);
      setSubmitProgress(100);
      setSubmitMessage('✅ Gửi đơn thành công!');
      
      setTimeout(async () => {
        closeDialog();
        await loadMyLeaveRequests();
      }, 1500);
    } catch (err: any) {
      setSubmitting(false);
      setSubmitProgress(0);
      setSubmitMessage('');
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
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Đơn nghỉ phép của tôi</h1>
          <p className="text-gray-600 mt-2">Quản lý và tạo mới đơn xin nghỉ phép</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Tạo đơn mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng đơn</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{leaveRequests.length}</p>
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
                <p className="text-3xl font-bold text-gray-900 mt-1">{pendingCount}</p>
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
                <p className="text-3xl font-bold text-gray-900 mt-1">{approvedCount}</p>
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
                <p className="text-3xl font-bold text-gray-900 mt-1">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests List */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle>Lịch sử đơn nghỉ phép</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {leaveRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Bạn chưa có đơn nghỉ phép nào</p>
            </div>
          ) : (
            <div className="divide-y">
              {leaveRequests.map((request) => {
                const status = getStatusBadge(request.trangThai);
                return (
                  <div key={request.maDon} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            Đơn #{request.maDon}
                          </h3>
                          <Badge variant="outline" className={status.className}>
                            {status.label}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <Calendar className="w-4 h-4 inline mr-2" />
                            <strong>Ngày nghỉ:</strong> {new Date(request.ngayNghi).toLocaleDateString('vi-VN')}
                          </p>
                          <p>
                            <strong>Lý do:</strong> {request.lyDo || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div>
                        {request.trangThai === 'cho_duyet' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelRequest(request.maDon)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl bg-white shadow-2xl">
            <CardHeader className="border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Tạo đơn nghỉ phép mới</CardTitle>
                    <p className="text-blue-100 text-sm mt-1">Điền thông tin đơn xin nghỉ phép của bạn</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeDialog}
                  disabled={submitting}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 bg-white">
              {submitting ? (
                <div className="py-8 px-4">
                  {/* Loading State */}
                  <div className="text-center space-y-6">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 border-8 border-blue-100 rounded-full"></div>
                      <div 
                        className="absolute inset-0 border-8 border-blue-600 rounded-full border-t-transparent animate-spin"
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Send className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {submitProgress === 100 ? 'Hoàn thành!' : 'Đang xử lý...'}
                      </h3>
                      <p className="text-gray-600">{submitMessage}</p>
                      
                      {/* Progress Bar */}
                      <div className="max-w-md mx-auto">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000 ease-out"
                            style={{ width: `${submitProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{submitProgress}%</p>
                      </div>
                      
                      {submitProgress === 100 && (
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Đơn nghỉ phép đã được gửi thành công</span>
                        </div>
                      )}
                      
                      {submitProgress < 100 && (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4 animate-pulse" />
                          <span>Vui lòng chờ trong giây lát...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Form Fields */}
                  <div className="space-y-5">
                    <div className="relative">
                      <Label htmlFor="ngayNghi" className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        Ngày nghỉ <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="ngayNghi"
                        type="date"
                        value={formData.ngayNghi}
                        onChange={(e) => setFormData({ ...formData, ngayNghi: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-lg py-6"
                      />
                      <p className="text-xs text-gray-500 mt-1.5 ml-1">Chọn ngày bạn muốn nghỉ phép</p>
                    </div>

                    <div className="relative">
                      <Label htmlFor="lyDo" className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Lý do nghỉ <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="lyDo"
                        value={formData.lyDo}
                        onChange={(e) => setFormData({ ...formData, lyDo: e.target.value })}
                        placeholder="Ví dụ: Việc gia đình, khám bệnh, du lịch..."
                        rows={5}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none text-base"
                      />
                      <p className="text-xs text-gray-500 mt-1.5 ml-1">
                        {formData.lyDo.length}/500 ký tự
                      </p>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                        <ul className="space-y-1 list-disc list-inside text-blue-700">
                          <li>Đơn nghỉ phép cần được gửi trước ít nhất 1 ngày</li>
                          <li>Quản lý sẽ xem xét và phản hồi trong vòng 24 giờ</li>
                          <li>Bạn có thể hủy đơn khi còn ở trạng thái "Chờ duyệt"</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleCreateLeaveRequest}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Gửi đơn nghỉ phép
                    </Button>
                    <Button
                      variant="outline"
                      onClick={closeDialog}
                      className="px-8 py-6 text-base border-gray-300 hover:bg-gray-50"
                    >
                      Hủy bỏ
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
