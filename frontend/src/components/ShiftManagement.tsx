import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Trash2, Loader2, Building2, Edit, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import ShiftService, { type ShiftDto, type ShiftAssignmentDto } from '../services/ShiftService';
import EmployeeService, { type EmployeeDto } from '../services/EmployeeService';

type DialogMode = 'create' | 'edit' | 'assign' | null;

export function ShiftManagement() {
  const [shifts, setShifts] = useState<ShiftDto[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignmentDto[]>([]);
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [viewAll, setViewAll] = useState(false);
  
  // Dialog states
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedShift, setSelectedShift] = useState<ShiftDto | null>(null);
  const [formData, setFormData] = useState({
    maCoSo: 1,
    ngay: '',
    gioBatDau: '',
    gioKetThuc: '',
    tenCa: '',
    maNv: 0,
  });

  useEffect(() => {
    loadData();
  }, [selectedDate, viewAll]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [shiftsData, assignmentsData, employeesData] = await Promise.all([
        viewAll ? ShiftService.getAllShifts() : ShiftService.getShiftsByDate(selectedDate),
        ShiftService.getAllShiftAssignments(),
        EmployeeService.getAllEmployees(),
      ]);
      setShifts(shiftsData);
      setAssignments(assignmentsData);
      setEmployees(employeesData);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setFormData({
      maCoSo: 1,
      ngay: selectedDate,
      gioBatDau: '08:00',
      gioKetThuc: '17:00',
      tenCa: '',
      maNv: 0,
    });
    setSelectedShift(null);
    setDialogMode('create');
  };

  const openEditDialog = (shift: ShiftDto) => {
    const date = new Date(shift.ngay);
    const dateStr = date.toISOString().split('T')[0];
    
    const formatTime = (timeSpan: string) => {
      const parts = timeSpan.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    };

    setFormData({
      maCoSo: shift.maCoSo,
      ngay: dateStr,
      gioBatDau: formatTime(shift.gioBatDau),
      gioKetThuc: formatTime(shift.gioKetThuc),
      tenCa: shift.tenCa || '',
      maNv: 0,
    });
    setSelectedShift(shift);
    setDialogMode('edit');
  };

  const openAssignDialog = (shift: ShiftDto) => {
    setSelectedShift(shift);
    setFormData(prev => ({ ...prev, maNv: 0 }));
    setDialogMode('assign');
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedShift(null);
  };

  const handleCreateShift = async () => {
    try {
      if (!formData.tenCa.trim()) {
        alert('Vui lòng nhập tên ca');
        return;
      }

      await ShiftService.createShift({
        maCoSo: formData.maCoSo,
        ngay: formData.ngay,
        gioBatDau: formData.gioBatDau,
        gioKetThuc: formData.gioKetThuc,
        tenCa: formData.tenCa,
      });
      
      closeDialog();
      await loadData();
      alert('Tạo ca trực thành công!');
    } catch (err: any) {
      alert(err.message || 'Không thể tạo ca trực');
    }
  };

  const handleUpdateShift = async () => {
    if (!selectedShift) return;

    try {
      await ShiftService.updateShift(selectedShift.maCa, {
        ngay: formData.ngay,
        gioBatDau: formData.gioBatDau,
        gioKetThuc: formData.gioKetThuc,
        tenCa: formData.tenCa,
      });
      
      closeDialog();
      await loadData();
      alert('Cập nhật ca trực thành công!');
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật ca trực');
    }
  };

  const handleAssignShift = async () => {
    if (!selectedShift || !formData.maNv) {
      alert('Vui lòng chọn nhân viên');
      return;
    }

    try {
      await ShiftService.assignShift({
        maCa: selectedShift.maCa,
        maNv: formData.maNv,
      });
      
      closeDialog();
      await loadData();
      alert('Phân công nhân viên thành công!');
    } catch (err: any) {
      alert(err.message || 'Không thể phân công nhân viên');
    }
  };

  const handleDeleteShift = async (maCa: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ca trực này?')) return;
    
    try {
      await ShiftService.deleteShift(maCa);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa ca trực');
    }
  };

  const handleRemoveAssignment = async (maPc: number) => {
    if (!confirm('Bạn có chắc chắn muốn hủy phân công này?')) return;
    
    try {
      await ShiftService.removeShiftAssignment(maPc);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Không thể hủy phân công');
    }
  };

  const getEmployeeForShift = (maCa: number) => {
    return assignments.filter(a => a.maCa === maCa);
  };

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
          <Button onClick={loadData} className="mt-3 bg-red-600 hover:bg-red-700">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-800">Quản lý Ca trực</h1>
        <p className="text-gray-600 mt-2">Quản lý lịch ca trực và phân công nhân viên</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Ca trực hôm nay</p>
                <p className="text-gray-900 mt-1">{shifts.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Đã phân công</p>
                <p className="text-gray-900 mt-1">{assignments.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Nhân viên có lịch</p>
                <p className="text-gray-900 mt-1">
                  {new Set(assignments.map(a => a.maNv)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng nhân viên</p>
                <p className="text-gray-900 mt-1">{employees.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Selector and Actions */}
      <Card className="shadow-sm mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
            <div className="flex gap-4 flex-1">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn ngày
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="max-w-xs"
                  disabled={viewAll}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant={viewAll ? "default" : "outline"}
                  onClick={() => setViewAll(!viewAll)}
                >
                  {viewAll ? 'Xem theo ngày' : 'Xem tất cả'}
                </Button>
              </div>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={openCreateDialog}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo ca trực mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shifts List */}
      <div className="space-y-4">
        {shifts.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                Không có ca trực nào trong ngày này
              </div>
            </CardContent>
          </Card>
        ) : (
          shifts.map((shift) => {
            const shiftAssignments = getEmployeeForShift(shift.maCa);
            return (
              <Card key={shift.maCa} className="shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {shift.tenCa || `Ca ${shift.maCa}`}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {shift.gioBatDau} - {shift.gioKetThuc}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {shift.ngay}
                          </span>
                          {shift.tenCoSo && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {shift.tenCoSo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        {shiftAssignments.length} nhân viên
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => openEditDialog(shift)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteShift(shift.maCa)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {shiftAssignments.length === 0 ? (
                    <div className="text-sm text-gray-500 py-2">
                      Chưa có nhân viên được phân công
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Danh sách nhân viên được phân công:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {shiftAssignments.map((assignment) => (
                          <div
                            key={assignment.maPc}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm">
                                {assignment.tenNhanVien?.split(' ').slice(-1)[0][0] || 'N'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {assignment.tenNhanVien}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {assignment.chucVu}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-100 h-8 w-8 p-0"
                              onClick={() => handleRemoveAssignment(assignment.maPc)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => openAssignDialog(shift)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Phân công nhân viên
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create/Edit Shift Dialog */}
      {(dialogMode === 'create' || dialogMode === 'edit') && (
        <div className="fixed inset-0 bg-white bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {dialogMode === 'create' ? 'Tạo ca trực mới' : 'Chỉnh sửa ca trực'}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên ca <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.tenCa}
                  onChange={(e) => setFormData(prev => ({ ...prev, tenCa: e.target.value }))}
                  placeholder="VD: Ca sáng, Ca chiều..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.ngay}
                  onChange={(e) => setFormData(prev => ({ ...prev, ngay: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="time"
                    value={formData.gioBatDau}
                    onChange={(e) => setFormData(prev => ({ ...prev, gioBatDau: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ kết thúc <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="time"
                    value={formData.gioKetThuc}
                    onChange={(e) => setFormData(prev => ({ ...prev, gioKetThuc: e.target.value }))}
                  />
                </div>
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
                  onClick={dialogMode === 'create' ? handleCreateShift : handleUpdateShift}
                >
                  {dialogMode === 'create' ? 'Tạo ca' : 'Cập nhật'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assign Employee Dialog */}
      {dialogMode === 'assign' && selectedShift && (
        <div className="fixed inset-0 bg-white bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Phân công nhân viên</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeDialog}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Ca: {selectedShift.tenCa} ({selectedShift.gioBatDau} - {selectedShift.gioKetThuc})
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn nhân viên <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.maNv}
                  onChange={(e) => setFormData(prev => ({ ...prev, maNv: Number(e.target.value) }))}
                >
                  <option value={0}>-- Chọn nhân viên --</option>
                  {employees
                    .filter(emp => emp.isActive !== false)
                    .map(emp => (
                      <option key={emp.maNv} value={emp.maNv}>
                        {emp.hoTen} - {emp.chucVu}
                      </option>
                    ))}
                </select>
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
                  onClick={handleAssignShift}
                >
                  Phân công
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
