import { useState, useEffect } from 'react';
import { Building2, Wrench, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import FieldService, { type FieldDto } from '../services/FieldService';

export function FieldStatusManagement() {
  const [fields, setFields] = useState<FieldDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingField, setUpdatingField] = useState<number | null>(null);

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await FieldService.getAllFields();
      setFields(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách sân');
      console.error('Error loading fields:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (maSan: number, tinhTrang: string) => {
    try {
      setUpdatingField(maSan);
      await FieldService.updateFieldStatus(maSan, { tinhTrang });
      await loadFields();
      alert('Cập nhật trạng thái sân thành công!');
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật trạng thái sân');
    } finally {
      setUpdatingField(null);
    }
  };

  const getStatusBadge = (tinhTrang?: string) => {
    const statusMap = {
      san_sang: { label: 'Sẵn sàng', class: 'bg-green-100 text-green-700 border-green-200' },
      dang_su_dung: { label: 'Đang sử dụng', class: 'bg-blue-100 text-blue-700 border-blue-200' },
      bao_tri: { label: 'Bảo trì', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      khong_kha_dung: { label: 'Không khả dụng', class: 'bg-red-100 text-red-700 border-red-200' },
    };
    const status = statusMap[tinhTrang as keyof typeof statusMap] || statusMap.san_sang;
    return { label: status.label, className: status.class };
  };

  const statusOptions = [
    { value: 'san_sang', label: 'Sẵn sàng', color: 'green' },
    { value: 'dang_su_dung', label: 'Đang sử dụng', color: 'blue' },
    { value: 'bao_tri', label: 'Bảo trì', color: 'yellow' },
    { value: 'khong_kha_dung', label: 'Không khả dụng', color: 'red' },
  ];

  // Statistics
  const totalFields = fields.length;
  const availableFields = fields.filter(f => f.tinhTrang === 'san_sang').length;
  const maintenanceFields = fields.filter(f => f.tinhTrang === 'bao_tri').length;
  const unavailableFields = fields.filter(f => f.tinhTrang === 'khong_kha_dung').length;

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
          <Button onClick={loadFields} className="mt-3 bg-red-600 hover:bg-red-700">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-800">Quản lý trạng thái sân</h1>
        <p className="text-gray-600 mt-2">Cập nhật trạng thái bảo trì và khả dụng của sân</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng số sân</p>
                <p className="text-gray-900 mt-1">{totalFields}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Sẵn sàng</p>
                <p className="text-gray-900 mt-1">{availableFields}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Đang bảo trì</p>
                <p className="text-gray-900 mt-1">{maintenanceFields}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                <Wrench className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Không khả dụng</p>
                <p className="text-gray-900 mt-1">{unavailableFields}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fields List */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Danh sách sân</CardTitle>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Chưa có sân nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field) => {
                const status = getStatusBadge(field.tinhTrang);
                const isUpdating = updatingField === field.maSan;
                
                return (
                  <div
                    key={field.maSan}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 className="w-5 h-5 text-gray-600" />
                          <h3 className="font-medium text-gray-900">
                            {field.tenSan || `Sân #${field.maSan}`}
                          </h3>
                          <Badge className={status.className}>
                            {status.label}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1 ml-8">
                          <p>
                            <span className="font-medium">Loại sân:</span> {field.tenLoai || 'Không xác định'}
                          </p>
                          <p>
                            <span className="font-medium">Cơ sở:</span> {field.tenCoSo || 'Không xác định'}
                          </p>
                          {field.sucChua && (
                            <p>
                              <span className="font-medium">Sức chứa:</span> {field.sucChua} người
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <p className="text-sm font-medium text-gray-700 mb-1">Thay đổi trạng thái:</p>
                        <Select
                          value={field.tinhTrang || 'san_sang'}
                          onValueChange={(value) => handleUpdateStatus(field.maSan, value)}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              {isUpdating ? (
                                <span className="flex items-center">
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Đang cập nhật...
                                </span>
                              ) : (
                                status.label
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${
                                    option.color === 'green' ? 'bg-green-500' :
                                    option.color === 'blue' ? 'bg-blue-500' :
                                    option.color === 'yellow' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`} />
                                  {option.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
