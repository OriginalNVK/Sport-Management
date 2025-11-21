import { useState } from 'react';
import { Search, UserPlus, MoreVertical, Mail, Phone, Shield } from 'lucide-react';
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

const users = [
  { id: 1, name: 'John Doe', email: 'john.doe@email.com', phone: '+1 234 567 8901', role: 'Admin', status: 'Active', bookings: 12 },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@email.com', phone: '+1 234 567 8902', role: 'User', status: 'Active', bookings: 8 },
  { id: 3, name: 'Mike Johnson', email: 'mike.j@email.com', phone: '+1 234 567 8903', role: 'User', status: 'Active', bookings: 15 },
  { id: 4, name: 'Sarah Williams', email: 'sarah.w@email.com', phone: '+1 234 567 8904', role: 'Manager', status: 'Active', bookings: 6 },
  { id: 5, name: 'Tom Brown', email: 'tom.brown@email.com', phone: '+1 234 567 8905', role: 'User', status: 'Inactive', bookings: 3 },
  { id: 6, name: 'Emily Davis', email: 'emily.d@email.com', phone: '+1 234 567 8906', role: 'User', status: 'Active', bookings: 20 },
];

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const colors = {
      Admin: 'bg-red-100 text-red-700 border-red-200',
      Manager: 'bg-blue-100 text-blue-700 border-blue-200',
      User: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[role as keyof typeof colors] || colors.User;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-800">User Management</h1>
        <p className="text-gray-600 mt-2">Manage and monitor all users in your system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-gray-900 mt-1">2,543</p>
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
                <p className="text-gray-600 text-sm">Active Users</p>
                <p className="text-gray-900 mt-1">2,124</p>
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
                <p className="text-gray-600 text-sm">New This Month</p>
                <p className="text-gray-900 mt-1">156</p>
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
                <p className="text-gray-900 mt-1">8</p>
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
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-gray-600">User</th>
                  <th className="text-left py-4 px-4 text-gray-600">Contact</th>
                  <th className="text-left py-4 px-4 text-gray-600">Role</th>
                  <th className="text-left py-4 px-4 text-gray-600">Status</th>
                  <th className="text-left py-4 px-4 text-gray-600">Bookings</th>
                  <th className="text-left py-4 px-4 text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-gray-900">{user.name}</p>
                          <p className="text-gray-500 text-sm flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {user.phone}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getRoleBadge(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={user.status === 'Active' 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                      }>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">{user.bookings}</span>
                    </td>
                    <td className="py-4 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit User</DropdownMenuItem>
                          <DropdownMenuItem>Change Role</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete User</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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