import { CreditCard, DollarSign, TrendingUp, CheckCircle, Clock, XCircle, Trash2, Plus, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { UserRole } from '../App';

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

interface PaymentProps {
  userRole: UserRole;
}

export function Payment({ userRole }: PaymentProps) {
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

  // Customer View - Customer Payment History
  if (userRole === 'customer') {
    // Danh sách hóa đơn đã tạo (chưa thanh toán)
    const invoices = [
      {
        id: 1,
        invoice: 'INV-005',
        description: 'Football Field D - 2 hours',
        date: '2025-12-05',
        dueDate: '2025-12-10',
        amount: 110,
        status: 'pending',
      },
      {
        id: 2,
        invoice: 'INV-006',
        description: 'Volleyball Court B - 1 hour',
        date: '2025-12-08',
        dueDate: '2025-12-15',
        amount: 35,
        status: 'pending',
      },
      {
        id: 3,
        invoice: 'INV-007',
        description: 'Basketball Court C - 2 hours',
        date: '2025-12-10',
        dueDate: '2025-12-17',
        amount: 80,
        status: 'pending',
      },
    ];

    // Danh sách hóa đơn đã thanh toán
    const paidInvoices = [
      {
        id: 1,
        invoice: 'INV-001',
        description: 'Football Field A - 2 hours',
        date: '2025-11-20',
        paidDate: '2025-11-21',
        amount: 100,
        status: 'paid',
        method: 'Credit Card',
      },
      {
        id: 2,
        invoice: 'INV-002',
        description: 'Volleyball Court B - 2 hours',
        date: '2025-11-25',
        paidDate: '2025-11-26',
        amount: 70,
        status: 'paid',
        method: 'PayPal',
      },
      {
        id: 3,
        invoice: 'INV-003',
        description: 'Basketball Court C - 3 hours',
        date: '2025-11-28',
        paidDate: '2025-11-29',
        amount: 120,
        status: 'paid',
        method: 'Credit Card',
      },
      {
        id: 4,
        invoice: 'INV-004',
        description: 'Tennis Court E - 2 hours',
        date: '2025-11-30',
        paidDate: '2025-12-01',
        amount: 60,
        status: 'paid',
        method: 'Debit Card',
      },
    ];

    return (
      <div className="p-8">
        <h1 className="mb-8 text-gray-800">Payment & Invoices</h1>

        <Tabs defaultValue="invoices" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 border-2 border-gray-300">
            <TabsTrigger 
              value="invoices" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <CreditCard className="w-4 h-4" />
              Payments
            </TabsTrigger>
          </TabsList>

          {/* Tab Invoices */}
          <TabsContent value="invoices" className="space-y-8">
            {/* Create Invoice Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Plus className="w-6 h-6 text-blue-600" />
                  <h2 className="text-gray-700">Create New Invoice</h2>
                </div>
              </div>
              <Card className="shadow-sm border-2 border-blue-100">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Select Booking
                        </label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>Booking #001 - Football Field A</option>
                          <option>Booking #002 - Basketball Court C</option>
                          <option>Booking #003 - Tennis Court E</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Tax Rate (%)
                        </label>
                        <input
                          type="number"
                          defaultValue="10"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Discount Codes (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter discount codes separated by comma"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Invoice
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Unpaid Invoices List */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-6 h-6 text-yellow-600" />
                <h2 className="text-gray-700">Unpaid Invoices</h2>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  {invoices.length} pending
                </Badge>
              </div>
              <Card className="shadow-sm">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm text-gray-700">Invoice ID</th>
                          <th className="px-6 py-3 text-left text-sm text-gray-700">Description</th>
                          <th className="px-6 py-3 text-left text-sm text-gray-700">Created Date</th>
                          <th className="px-6 py-3 text-left text-sm text-gray-700">Due Date</th>
                          <th className="px-6 py-3 text-left text-sm text-gray-700">Amount</th>
                          <th className="px-6 py-3 text-left text-sm text-gray-700">Status</th>
                          <th className="px-6 py-3 text-right text-sm text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {invoices.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                {invoice.invoice}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-900">{invoice.description}</td>
                            <td className="px-6 py-4 text-gray-600">{invoice.date}</td>
                            <td className="px-6 py-4">
                              <span className="text-red-600">{invoice.dueDate}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-lg text-gray-900">${invoice.amount}</span>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CreditCard className="w-4 h-4 mr-1" />
                                  Pay
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="mt-4 shadow-sm bg-yellow-50 border-yellow-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-8 h-8 text-yellow-600" />
                      <div>
                        <p className="text-gray-600">Total Outstanding</p>
                        <p className="text-2xl text-gray-900">
                          ${invoices.reduce((sum, inv) => sum + inv.amount, 0)}
                        </p>
                      </div>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      Pay All Invoices
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Tab Payments */}
          <TabsContent value="payments" className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h2 className="text-gray-700">Payment History</h2>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {paidInvoices.length} completed
                </Badge>
              </div>
              <Card className="shadow-sm">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm text-gray-700">Invoice ID</th>
                          <th className="px-6 py-3 text-left text-sm text-gray-700">Description</th>
                          <th className="px-6 py-3 text-left text-sm text-gray-700">Booking Date</th>
                          <th className="px-6 py-3 text-left text-sm text-gray-700">Paid Date</th>
                          <th className="px-6 py-3 text-left text-sm text-gray-700">Amount</th>
                          <th className="px-6 py-3 text-left text-sm text-gray-700">Method</th>
                          <th className="px-6 py-3 text-left text-sm text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paidInvoices.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                                {payment.invoice}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-900">{payment.description}</td>
                            <td className="px-6 py-4 text-gray-600">{payment.date}</td>
                            <td className="px-6 py-4 text-gray-600">{payment.paidDate}</td>
                            <td className="px-6 py-4">
                              <span className="text-lg text-gray-900">${payment.amount}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-gray-600">
                                <CreditCard className="w-4 h-4" />
                                {payment.method}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Paid
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="mt-4 shadow-sm bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-gray-600">Total Paid</p>
                        <p className="text-2xl text-gray-900">
                          ${paidInvoices.reduce((sum, p) => sum + p.amount, 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-gray-600">Total Transactions</p>
                        <p className="text-2xl text-gray-900">{paidInvoices.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-purple-600" />
                      <div>
                        <p className="text-gray-600">Average Payment</p>
                        <p className="text-2xl text-gray-900">
                          ${Math.round(paidInvoices.reduce((sum, p) => sum + p.amount, 0) / paidInvoices.length)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Manager View - Payment Management
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