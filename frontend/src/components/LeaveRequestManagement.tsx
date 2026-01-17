import { useState, useEffect } from 'react';
import { FileText, Search, CheckCircle, XCircle, Clock, Loader2, User, RefreshCw } from 'lucide-react';
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
      setLeaveRequests(data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đơn nghỉ phép');
      setLeaveRequests([]);
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

  const filteredRequests = (leaveRequests || []).filter(req => {
    const matchesSearch = req.tenNhanVien?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.lyDo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.trangThai === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = (leaveRequests || []).filter(r => r.trangThai === 'cho_duyet').length;
  const approvedCount = (leaveRequests || []).filter(r => r.trangThai === 'da_duyet').length;
  const rejectedCount = (leaveRequests || []).filter(r => r.trangThai === 'tu_choi').length;

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
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Đơn nghỉ phép</h1>
        <p className="text-gray-600 mt-2">Duyệt và quản lý các đơn nghỉ phép của nhân viên</p>
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
                <p className="text-3xl font-bold text-gray-900 mt-1">{approvedCount}</p>
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
                <p className="text-3xl font-bold text-gray-900 mt-1">{rejectedCount}</p>
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

      {/* Leave Requests Table */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách đơn nghỉ phép</CardTitle>
            <Button onClick={loadLeaveRequests} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Không có đơn nghỉ phép nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã đơn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nhân viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chức vụ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày nghỉ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lý do
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => {
                    const status = getStatusBadge(request.trangThai);
                    return (
                      <tr key={request.maDon} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          #{request.maDon}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {request.tenNhanVien || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {request.chucVu || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(request.ngayNghi).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {request.lyDo || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className={status.className}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {request.trangThai === 'cho_duyet' ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(request.maDon)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Duyệt
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(request.maDon)}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Từ chối
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(request.maDon)}
                              className="border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                              Xóa
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
