import { useState, useEffect } from 'react';
import { Calendar, Clock, Building2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import ShiftService, { type ShiftAssignmentDto } from '../services/ShiftService';

export function MyShifts() {
  const [shifts, setShifts] = useState<ShiftAssignmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Lấy mã nhân viên từ localStorage
      const maNv = localStorage.getItem('maNv');
      if (!maNv) {
        setError('Không tìm thấy thông tin nhân viên');
        return;
      }

      const data = await ShiftService.getShiftAssignmentsByEmployee(Number(maNv));
      setShifts(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách ca trực');
      console.error('Error loading shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredShifts = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return shifts.filter(shift => {
      if (!shift.ngay) return false;
      
      const shiftDate = new Date(shift.ngay);
      shiftDate.setHours(0, 0, 0, 0);

      if (filterType === 'upcoming') {
        return shiftDate >= today;
      } else if (filterType === 'past') {
        return shiftDate < today;
      }
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.ngay || 0);
      const dateB = new Date(b.ngay || 0);
      return dateB.getTime() - dateA.getTime();
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (timeSpan?: string) => {
    if (!timeSpan) return 'N/A';
    return timeSpan.substring(0, 5);
  };

  const getDayOfWeek = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[date.getDay()];
  };

  const isUpcoming = (dateString?: string) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const shiftDate = new Date(dateString);
    shiftDate.setHours(0, 0, 0, 0);
    return shiftDate >= today;
  };

  const filteredShifts = getFilteredShifts();

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-600">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Ca trực của tôi</h1>
        <p className="text-gray-600 mt-2">Xem lịch ca trực được phân công</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng số ca</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{shifts.length}</p>
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
                <p className="text-gray-600 text-sm">Ca sắp tới</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {shifts.filter(s => isUpcoming(s.ngay)).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Ca đã qua</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {shifts.filter(s => !isUpcoming(s.ngay)).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <Card className="shadow-sm mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
            >
              Tất cả
            </Button>
            <Button
              variant={filterType === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setFilterType('upcoming')}
            >
              Ca sắp tới
            </Button>
            <Button
              variant={filterType === 'past' ? 'default' : 'outline'}
              onClick={() => setFilterType('past')}
            >
              Ca đã qua
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shifts List */}
      <div className="space-y-4">
        {filteredShifts.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                Không có ca trực nào
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredShifts.map((shift) => {
            const upcoming = isUpcoming(shift.ngay);
            return (
              <Card 
                key={shift.maPc} 
                className={`shadow-sm ${upcoming ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        upcoming ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Clock className={`w-6 h-6 ${upcoming ? 'text-green-600' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {shift.tenCa || `Ca ${shift.maCa}`}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(shift.gioBatDau)} - {formatTime(shift.gioKetThuc)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {getDayOfWeek(shift.ngay)}, {formatDate(shift.ngay)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {upcoming ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          Sắp tới
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          Đã qua
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
