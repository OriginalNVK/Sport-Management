import { useState, useEffect } from 'react';
import { Search, UserPlus, MoreVertical, Mail, Phone, Shield, Loader2, X, Eye } from 'lucide-react';
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
import EmployeeService, { type EmployeeDto, type CreateEmployeeRequest, type UpdateEmployeeRequest } from '../services/EmployeeService';

type DialogMode = 'create' | 'edit' | 'view' | null;

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDto | null>(null);
  const [formData, setFormData] = useState<CreateEmployeeRequest>({
    hoTen: '',
    email: '',
    sdt: '',
    gioiTinh: 'Nam',
    chucVu: '',
    luongCoBan: 0,
    maCoSo: 1,
    cmndCccd: '',
    diaChi: '',
    ngaySinh: '',
    ngayTuyen: new Date().toISOString().split('T')[0],
    tenDangNhap: '',
    matKhau: '',
    vaiTro: 'nhan_vien',
  });

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

  const openCreateDialog = () => {
    setFormData({
      hoTen: '',
      email: '',
      sdt: '',
      gioiTinh: 'Nam',
      chucVu: '',
      luongCoBan: 0,
      maCoSo: 1,
      cmndCccd: '',
      diaChi: '',
      ngaySinh: '',
      ngayTuyen: new Date().toISOString().split('T')[0],
      tenDangNhap: '',
      matKhau: '',
      vaiTro: 'nhan_vien',
    });
    setSelectedEmployee(null);
    setDialogMode('create');
  };

  const openEditDialog = (emp: EmployeeDto) => {
    const ngaySinh = emp.ngaySinh ? new Date(emp.ngaySinh).toISOString().split('T')[0] : '';
    const ngayTuyen = emp.ngayTuyen ? new Date(emp.ngayTuyen).toISOString().split('T')[0] : '';
    
    setFormData({
      hoTen: emp.hoTen,
      email: emp.email || '',
      sdt: emp.sdt || '',
      gioiTinh: emp.gioiTinh || 'Nam',
      chucVu: emp.chucVu || '',
      luongCoBan: emp.luongCoBan || 0,
      maCoSo: emp.maCoSo,
      cmndCccd: emp.cmndCccd || '',
      diaChi: emp.diaChi || '',
      ngaySinh: ngaySinh,
      ngayTuyen: ngayTuyen,
    });
    setSelectedEmployee(emp);
    setDialogMode('edit');
  };

  const openViewDialog = (emp: EmployeeDto) => {
    setSelectedEmployee(emp);
    setDialogMode('view');
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedEmployee(null);
  };

  const handleCreateEmployee = async () => {
    try {
      if (!formData.hoTen.trim()) {
        alert('Vui lòng nhập họ tên');
        return;
      }
      if (!formData.email.trim()) {
        alert('Vui lòng nhập email');
        return;
      }
      if (!formData.chucVu.trim()) {
        alert('Vui lòng nhập chức vụ');
        return;
      }
      if (!formData.tenDangNhap.trim()) {
        alert('Vui lòng nhập tên đăng nhập');
        return;
      }
      if (!formData.matKhau.trim() || formData.matKhau.length < 6) {
        alert('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }

      await EmployeeService.createEmployee(formData);
      closeDialog();
      await loadEmployees();
      alert('Thêm nhân viên thành công!');
    } catch (err: any) {
      alert(err.message || 'Không thể thêm nhân viên');
    }
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      const updateData: UpdateEmployeeRequest = {
        hoTen: formData.hoTen,
        email: formData.email,
        sdt: formData.sdt,
        gioiTinh: formData.gioiTinh,
        chucVu: formData.chucVu,
        luongCoBan: formData.luongCoBan,
        cmndCccd: formData.cmndCccd,
        diaChi: formData.diaChi,
        ngaySinh: formData.ngaySinh,
      };

      await EmployeeService.updateEmployee(selectedEmployee.maNv, updateData);
      closeDialog();
      await loadEmployees();
      alert('Cập nhật nhân viên thành công!');
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật nhân viên');
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
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={openCreateDialog}>
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
                            <DropdownMenuItem onClick={() => openViewDialog(emp)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(emp)}>
                              Chỉnh sửa
                            </DropdownMenuItem>
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

      {/* Create/Edit Employee Dialog */}
      {(dialogMode === 'create' || dialogMode === 'edit') && (
        <div className="fixed inset-0 bg-white bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl shadow-xl my-8">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {dialogMode === 'create' ? 'Thêm nhân viên mới' : 'Chỉnh sửa thông tin nhân viên'}
                </CardTitle>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.hoTen}
                    onChange={(e) => setFormData(prev => ({ ...prev, hoTen: e.target.value }))}
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <Input
                    value={formData.sdt}
                    onChange={(e) => setFormData(prev => ({ ...prev, sdt: e.target.value }))}
                    placeholder="0123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CMND/CCCD
                  </label>
                  <Input
                    value={formData.cmndCccd}
                    onChange={(e) => setFormData(prev => ({ ...prev, cmndCccd: e.target.value }))}
                    placeholder="001234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.gioiTinh}
                    onChange={(e) => setFormData(prev => ({ ...prev, gioiTinh: e.target.value }))}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  <Input
                    type="date"
                    value={formData.ngaySinh}
                    onChange={(e) => setFormData(prev => ({ ...prev, ngaySinh: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chức vụ <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.chucVu}
                    onChange={(e) => setFormData(prev => ({ ...prev, chucVu: e.target.value }))}
                    placeholder="VD: Nhân viên kinh doanh"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lương cơ bản
                  </label>
                  <Input
                    type="number"
                    value={formData.luongCoBan}
                    onChange={(e) => setFormData(prev => ({ ...prev, luongCoBan: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày tuyển dụng
                  </label>
                  <Input
                    type="date"
                    value={formData.ngayTuyen}
                    onChange={(e) => setFormData(prev => ({ ...prev, ngayTuyen: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <Input
                    value={formData.diaChi}
                    onChange={(e) => setFormData(prev => ({ ...prev, diaChi: e.target.value }))}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  />
                </div>

                {dialogMode === 'create' && (
                  <>
                    <div className="md:col-span-2 border-t pt-4 mt-2">
                      <h4 className="font-medium text-gray-900 mb-3">Thông tin tài khoản</h4>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên đăng nhập <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.tenDangNhap}
                        onChange={(e) => setFormData(prev => ({ ...prev, tenDangNhap: e.target.value }))}
                        placeholder="username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="password"
                        value={formData.matKhau}
                        onChange={(e) => setFormData(prev => ({ ...prev, matKhau: e.target.value }))}
                        placeholder="Tối thiểu 6 ký tự"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vai trò <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.vaiTro}
                        onChange={(e) => setFormData(prev => ({ ...prev, vaiTro: e.target.value }))}
                      >
                        <option value="nhan_vien">Nhân viên</option>
                        <option value="le_tan">Lễ tân</option>
                        <option value="thu_ngan">Thu ngân</option>
                        <option value="ky_thuat">Kỹ thuật</option>
                        <option value="quan_ly">Quản lý</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </>
                )}
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
                  onClick={dialogMode === 'create' ? handleCreateEmployee : handleUpdateEmployee}
                >
                  {dialogMode === 'create' ? 'Thêm nhân viên' : 'Cập nhật'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Employee Dialog */}
      {dialogMode === 'view' && selectedEmployee && (
        <div className="fixed inset-0 bg-white bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Thông tin chi tiết nhân viên</CardTitle>
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
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-2xl font-bold">
                  {selectedEmployee.hoTen.split(' ').slice(-1)[0][0]}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedEmployee.hoTen}</h3>
                  <p className="text-gray-600">{selectedEmployee.chucVu || 'Chưa có chức vụ'}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={selectedEmployee.kichHoat 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                    }>
                      {selectedEmployee.kichHoat ? 'Hoạt động' : 'Không hoạt động'}
                    </Badge>
                    <Badge className={getRoleBadge(selectedEmployee.vaiTro)}>
                      {getRoleDisplay(selectedEmployee.vaiTro)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mã nhân viên</p>
                  <p className="text-gray-900 font-medium">{selectedEmployee.maNv}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900 font-medium">{selectedEmployee.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                  <p className="text-gray-900 font-medium">{selectedEmployee.sdt || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">CMND/CCCD</p>
                  <p className="text-gray-900 font-medium">{selectedEmployee.cmndCccd || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giới tính</p>
                  <p className="text-gray-900 font-medium">{selectedEmployee.gioiTinh || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày sinh</p>
                  <p className="text-gray-900 font-medium">
                    {selectedEmployee.ngaySinh ? new Date(selectedEmployee.ngaySinh).toLocaleDateString('vi-VN') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lương cơ bản</p>
                  <p className="text-gray-900 font-medium">
                    {selectedEmployee.luongCoBan ? selectedEmployee.luongCoBan.toLocaleString('vi-VN') + ' VNĐ' : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày tuyển dụng</p>
                  <p className="text-gray-900 font-medium">
                    {selectedEmployee.ngayTuyen ? new Date(selectedEmployee.ngayTuyen).toLocaleDateString('vi-VN') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cơ sở</p>
                  <p className="text-gray-900 font-medium">{selectedEmployee.tenCoSo || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tên đăng nhập</p>
                  <p className="text-gray-900 font-medium">{selectedEmployee.tenDangNhap || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Địa chỉ</p>
                  <p className="text-gray-900 font-medium">{selectedEmployee.diaChi || '-'}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={closeDialog}
                >
                  Đóng
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    closeDialog();
                    openEditDialog(selectedEmployee);
                  }}
                >
                  Chỉnh sửa
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}