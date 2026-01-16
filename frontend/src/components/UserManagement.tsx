import { useState, useEffect } from 'react';
import { Search, UserPlus, MoreVertical, Mail, Phone, Shield, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import EmployeeService, { type EmployeeDto } from '../services/EmployeeService';

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await EmployeeService.getAllEmployees();
      setEmployees(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách nhân viên');
      console.error('Error loading employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (maNv: number) => {
    try {
      await EmployeeService.activateAccount(maNv);
      await loadEmployees();
    } catch (err: any) {
      alert(err.message || 'Không thể kích hoạt tài khoản');
    }
  };

  const handleDeactivate = async (maNv: number) => {
    try {
      await EmployeeService.deactivateAccount(maNv);
      await loadEmployees();
    } catch (err: any) {
      alert(err.message || 'Không thể vô hiệu hóa tài khoản');
    }
  };

  const handleDelete = async (maNv: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) return;
    
    try {
      await EmployeeService.deleteEmployee(maNv);
      await loadEmployees();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa nhân viên');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.sdt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (vaiTro?: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-700 border-red-200',
      quan_ly: 'bg-blue-100 text-blue-700 border-blue-200',
      nhan_vien: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[vaiTro as keyof typeof colors] || colors.nhan_vien;
  };

  const getRoleDisplay = (vaiTro?: string) => {
    const roles = {
      admin: 'Admin',
      quan_ly: 'Quản lý',
      nhan_vien: 'Nhân viên',
    };
    return roles[vaiTro as keyof typeof roles] || 'Nhân viên';
  };

  const activeCount = employees.filter(e => e.kichHoat).length;
  const adminCount = employees.filter(e => e.vaiTro === 'admin').length;

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
          <Button onClick={loadEmployees} className="mt-3 bg-red-600 hover:bg-red-700">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-800">Quản lý Nhân viên</h1>
        <p className="text-gray-600 mt-2">Quản lý và giám sát tất cả nhân viên trong hệ thống</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng nhân viên</p>
                <p className="text-gray-900 mt-1">{employees.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Đang hoạt động</p>
                <p className="text-gray-900 mt-1">{activeCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Không hoạt động</p>
                <p className="text-gray-900 mt-1">{employees.length - activeCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Admins</p>
                <p className="text-gray-900 mt-1">{adminCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card className="shadow-sm mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Tìm kiếm nhân viên theo tên, email hoặc SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => alert('Chức năng thêm nhân viên sẽ được phát triển')}>
              <UserPlus className="w-4 h-4 mr-2" />
              Thêm nhân viên
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Danh sách nhân viên</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Không tìm thấy nhân viên phù hợp' : 'Chưa có nhân viên nào'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 text-gray-600">Nhân viên</th>
                    <th className="text-left py-4 px-4 text-gray-600">Liên hệ</th>
                    <th className="text-left py-4 px-4 text-gray-600">Chức vụ</th>
                    <th className="text-left py-4 px-4 text-gray-600">Vai trò</th>
                    <th className="text-left py-4 px-4 text-gray-600">Trạng thái</th>
                    <th className="text-left py-4 px-4 text-gray-600">Cơ sở</th>
                    <th className="text-left py-4 px-4 text-gray-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.maNv} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                            {emp.hoTen.split(' ').slice(-1)[0][0]}
                          </div>
                          <div>
                            <p className="text-gray-900">{emp.hoTen}</p>
                            {emp.email && (
                              <p className="text-gray-500 text-sm flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {emp.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {emp.sdt && (
                          <p className="text-gray-600 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {emp.sdt}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-700">{emp.chucVu || '-'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getRoleBadge(emp.vaiTro)}>
                          {getRoleDisplay(emp.vaiTro)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={emp.kichHoat 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                        }>
                          {emp.kichHoat ? 'Hoạt động' : 'Không hoạt động'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-700">{emp.tenCoSo || '-'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                            <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                            {emp.kichHoat ? (
                              <DropdownMenuItem onClick={() => handleDeactivate(emp.maNv)}>
                                Vô hiệu hóa
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleActivate(emp.maNv)}>
                                Kích hoạt
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(emp.maNv)}
                            >
                              Xóa nhân viên
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}