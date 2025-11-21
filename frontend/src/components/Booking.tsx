import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';

const bookings = [
  {
    id: 1,
    user: 'John Doe',
    stadium: 'Champions Football Arena',
    date: '2025-11-15',
    time: '14:00 - 16:00',
    status: 'Confirmed',
    price: 300,
  },
  {
    id: 2,
    user: 'Jane Smith',
    stadium: 'Elite Basketball Court',
    date: '2025-11-15',
    time: '10:00 - 12:00',
    status: 'Confirmed',
    price: 160,
  },
  {
    id: 3,
    user: 'Mike Johnson',
    stadium: 'Premium Tennis Center',
    date: '2025-11-16',
    time: '16:00 - 18:00',
    status: 'Pending',
    price: 120,
  },
  {
    id: 4,
    user: 'Sarah Williams',
    stadium: 'Olympic Swimming Pool',
    date: '2025-11-16',
    time: '09:00 - 11:00',
    status: 'Confirmed',
    price: 240,
  },
  {
    id: 5,
    user: 'Tom Brown',
    stadium: 'Victory Stadium',
    date: '2025-11-17',
    time: '18:00 - 20:00',
    status: 'Cancelled',
    price: 400,
  },
];

export function Booking() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-800">Booking Management</h1>
        <p className="text-gray-600 mt-2">Manage all stadium bookings and reservations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Bookings</p>
                <p className="text-gray-900 mt-1">1,247</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Confirmed</p>
                <p className="text-gray-900 mt-1">892</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-gray-900 mt-1">234</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Cancelled</p>
                <p className="text-gray-900 mt-1">121</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
          <CardContent>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Create New Booking
            </Button>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-gray-900">{booking.stadium}</h3>
                        <Badge className={getStatusBadge(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600 text-sm flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {booking.user}
                        </p>
                        <p className="text-gray-600 text-sm flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {booking.date}
                        </p>
                        <p className="text-gray-600 text-sm flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {booking.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900">${booking.price}</p>
                      <div className="flex gap-2 mt-3">
                        {booking.status === 'Pending' && (
                          <>
                            <Button size="sm" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">
                              Reject
                            </Button>
                          </>
                        )}
                        {booking.status === 'Confirmed' && (
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Slots */}
      <Card className="shadow-sm mt-6">
        <CardHeader>
          <CardTitle>Available Time Slots - {date?.toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'].map((time) => (
              <Button
                key={time}
                variant="outline"
                className="h-16 border-2 hover:border-blue-500 hover:bg-blue-50"
              >
                <Clock className="w-4 h-4 mr-2" />
                {time}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}