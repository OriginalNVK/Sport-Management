import { useState, useEffect } from 'react';
import { FileText, Search, CheckCircle, XCircle, Clock, Loader2, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import LeaveService, { type LeaveRequestDto } from '../services/LeaveService';

export function LeaveRequestManagement() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await LeaveService.getAllLeaveRequests();
      setLeaveRequests(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đơn nghỉ phép');
      console.error('Error loading leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (maDon: number) => {
    if (!confirm('Bạn có chắc chắn muốn duyệt đơn nghỉ phép này?')) return;
    
    try {
      await LeaveService.approveLeaveRequest(maDon, { trangThai: 'da_duyet' });
      await loadLeaveRequests();
    } catch (err: any) {
      alert(err.message || 'Không thể duyệt đơn nghỉ phép');
    }
  };

  const handleReject = async (maDon: number) => {
    if (!confirm('Bạn có chắc chắn muốn từ chối đơn nghỉ phép này?')) return;
    
    try {
      await LeaveService.approveLeaveRequest(maDon, { trangThai: 'tu_choi' });
      await loadLeaveRequests();
    } catch (err: any) {
      alert(err.message || 'Không thể từ chối đơn nghỉ phép');
    }
  };

  const handleDelete = async (maDon: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn nghỉ phép này?')) return;
    
    try {
      await LeaveService.deleteLeaveRequest(maDon);
      await loadLeaveRequests();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa đơn nghỉ phép');
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

  const filteredRequests = leaveRequests.filter(req => {
    const matchesSearch = req.tenNhanVien?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.lyDo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.trangThai === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
          <p className="font-medium">Lỗi</p>
          <p className="text-sm mt-1">{error}</p>
          <Button onClick={loadLeaveRequests} className="mt-3 bg-red-600 hover:bg-red-700">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-800">Quản lý Đơn nghỉ phép</h1>
        <p className="text-gray-600 mt-2">Duyệt và quản lý các đơn nghỉ phép của nhân viên</p>
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
                <Clock className="w-6 h-6 text-yellow-600" />
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
                <CheckCircle className="w-6 h-6 text-green-600" />
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
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-sm mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Tìm kiếm theo tên nhân viên hoặc lý do..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
              >
                Tất cả
              </Button>
              <Button
                variant={filterStatus === 'cho_duyet' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('cho_duyet')}
              >
                Chờ duyệt
              </Button>
              <Button
                variant={filterStatus === 'da_duyet' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('da_duyet')}
              >
                Đã duyệt
              </Button>
              <Button
                variant={filterStatus === 'tu_choi' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('tu_choi')}
              >
                Từ chối
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Không tìm thấy đơn nghỉ phép phù hợp' 
                  : 'Chưa có đơn nghỉ phép nào'}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => {
            const statusBadge = getStatusBadge(request.trangThai);
            return (
              <Card key={request.maDon} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {request.tenNhanVien}
                          </h3>
                          <Badge className={statusBadge.className}>
                            {statusBadge.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Chức vụ:</span> {request.chucVu || '-'}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Ngày nghỉ:</span> {request.ngayNghi}
                        </p>
                        {request.lyDo && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Lý do:</span> {request.lyDo}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {request.trangThai === 'cho_duyet' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(request.maDon)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => handleReject(request.maDon)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Từ chối
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(request.maDon)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
