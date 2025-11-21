import { CreditCard, DollarSign, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const transactions = [
  {
    id: 'TXN-001',
    user: 'John Doe',
    service: 'Champions Football Arena',
    amount: 300,
    status: 'Completed',
    date: '2025-11-13 14:30',
    method: 'Credit Card',
  },
  {
    id: 'TXN-002',
    user: 'Jane Smith',
    service: 'Elite Basketball Court + Equipment',
    amount: 185,
    status: 'Completed',
    date: '2025-11-13 12:15',
    method: 'PayPal',
  },
  {
    id: 'TXN-003',
    user: 'Mike Johnson',
    service: 'Personal Trainer Session',
    amount: 80,
    status: 'Pending',
    date: '2025-11-13 10:45',
    method: 'Credit Card',
  },
  {
    id: 'TXN-004',
    user: 'Sarah Williams',
    service: 'Olympic Swimming Pool',
    amount: 240,
    status: 'Completed',
    date: '2025-11-12 16:20',
    method: 'Debit Card',
  },
  {
    id: 'TXN-005',
    user: 'Tom Brown',
    service: 'Victory Stadium + Catering',
    amount: 600,
    status: 'Failed',
    date: '2025-11-12 14:00',
    method: 'Credit Card',
  },
  {
    id: 'TXN-006',
    user: 'Emily Davis',
    service: 'Premium Tennis Center',
    amount: 120,
    status: 'Completed',
    date: '2025-11-12 11:30',
    method: 'PayPal',
  },
];

export function Payment() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-800">Payment Management</h1>
        <p className="text-gray-600 mt-2">Track and manage all payment transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-gray-900 mt-1">$124,500</p>
                <p className="text-green-600 text-sm mt-1">+18.7% from last month</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-gray-900 mt-1">$118,200</p>
                <p className="text-gray-600 text-sm mt-1">95% success rate</p>
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
                <p className="text-gray-900 mt-1">$4,800</p>
                <p className="text-gray-600 text-sm mt-1">12 transactions</p>
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
                <p className="text-gray-600 text-sm">Failed</p>
                <p className="text-gray-900 mt-1">$1,500</p>
                <p className="text-gray-600 text-sm mt-1">5 transactions</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { method: 'Credit Card', percentage: 65, color: 'bg-blue-500' },
                { method: 'PayPal', percentage: 25, color: 'bg-purple-500' },
                { method: 'Debit Card', percentage: 10, color: 'bg-green-500' },
              ].map((item) => (
                <div key={item.method}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{item.method}</span>
                    <span className="text-sm text-gray-900">{item.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">Avg Transaction</p>
                <p className="text-blue-900 mt-1">$156.50</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">Today's Revenue</p>
                <p className="text-green-900 mt-1">$8,450</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700">Total Transactions</p>
                <p className="text-purple-900 mt-1">1,247</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-700">This Month</p>
                <p className="text-orange-900 mt-1">$24,500</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Button variant="outline">Export Report</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-gray-600">Transaction ID</th>
                  <th className="text-left py-4 px-4 text-gray-600">User</th>
                  <th className="text-left py-4 px-4 text-gray-600">Service</th>
                  <th className="text-left py-4 px-4 text-gray-600">Amount</th>
                  <th className="text-left py-4 px-4 text-gray-600">Method</th>
                  <th className="text-left py-4 px-4 text-gray-600">Status</th>
                  <th className="text-left py-4 px-4 text-gray-600">Date</th>
                  <th className="text-left py-4 px-4 text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="text-blue-600">{transaction.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm">
                          {transaction.user.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-gray-900">{transaction.user}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">{transaction.service}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">${transaction.amount}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-600">{transaction.method}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusBadge(transaction.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(transaction.status)}
                          {transaction.status}
                        </div>
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600 text-sm">{transaction.date}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}