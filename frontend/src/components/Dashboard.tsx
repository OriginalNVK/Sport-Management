import { Users, Building2, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const bookingData = [
  { month: 'Jan', bookings: 45 },
  { month: 'Feb', bookings: 52 },
  { month: 'Mar', bookings: 61 },
  { month: 'Apr', bookings: 58 },
  { month: 'May', bookings: 70 },
  { month: 'Jun', bookings: 85 },
];

const revenueData = [
  { month: 'Jan', revenue: 12500 },
  { month: 'Feb', revenue: 15200 },
  { month: 'Mar', revenue: 18100 },
  { month: 'Apr', revenue: 16800 },
  { month: 'May', revenue: 21000 },
  { month: 'Jun', revenue: 24500 },
];

const stadiumUsage = [
  { name: 'Football', value: 45, color: '#10b981' },
  { name: 'Basketball', value: 25, color: '#f59e0b' },
  { name: 'Tennis', value: 20, color: '#3b82f6' },
  { name: 'Swimming', value: 10, color: '#8b5cf6' },
];

export function Dashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your sports facilities today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Total Users</CardTitle>
            <Users className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-gray-900">2,543</p>
                <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>12.5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Active Stadiums</CardTitle>
            <Building2 className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-gray-900">24</p>
                <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>8.2%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Total Bookings</CardTitle>
            <Calendar className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-gray-900">1,247</p>
                <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <TrendingDown className="w-4 h-4" />
                  <span>3.1%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Revenue</CardTitle>
            <DollarSign className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-gray-900">$24,500</p>
                <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>18.7%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Booking Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stadium Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Stadium Usage by Sport</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stadiumUsage}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stadiumUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { user: 'John Doe', action: 'booked Stadium A', time: '2 minutes ago', color: 'bg-blue-500' },
                { user: 'Jane Smith', action: 'completed payment', time: '15 minutes ago', color: 'bg-green-500' },
                { user: 'Mike Johnson', action: 'canceled booking', time: '1 hour ago', color: 'bg-red-500' },
                { user: 'Sarah Williams', action: 'added new service', time: '2 hours ago', color: 'bg-purple-500' },
                { user: 'Tom Brown', action: 'updated profile', time: '3 hours ago', color: 'bg-orange-500' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${activity.color}`} />
                  <div className="flex-1">
                    <p className="text-gray-900">{activity.user} {activity.action}</p>
                    <p className="text-gray-500 text-sm">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}