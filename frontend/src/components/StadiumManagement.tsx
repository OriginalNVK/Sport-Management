import { useState } from 'react';
import { Building2, MapPin, Users, DollarSign, Plus, MoreVertical, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const stadiums = [
  {
    id: 1,
    name: 'Champions Football Arena',
    type: 'Football',
    location: 'Downtown District',
    capacity: 500,
    pricePerHour: 150,
    status: 'Available',
    rating: 4.8,
    bookings: 245,
  },
  {
    id: 2,
    name: 'Elite Basketball Court',
    type: 'Basketball',
    location: 'Sports Complex North',
    capacity: 200,
    pricePerHour: 80,
    status: 'Available',
    rating: 4.6,
    bookings: 189,
  },
  {
    id: 3,
    name: 'Premium Tennis Center',
    type: 'Tennis',
    location: 'West End',
    capacity: 100,
    pricePerHour: 60,
    status: 'Maintenance',
    rating: 4.9,
    bookings: 156,
  },
  {
    id: 4,
    name: 'Olympic Swimming Pool',
    type: 'Swimming',
    location: 'Central Park',
    capacity: 300,
    pricePerHour: 120,
    status: 'Available',
    rating: 4.7,
    bookings: 203,
  },
  {
    id: 5,
    name: 'Victory Stadium',
    type: 'Football',
    location: 'Stadium District',
    capacity: 800,
    pricePerHour: 200,
    status: 'Booked',
    rating: 4.9,
    bookings: 312,
  },
  {
    id: 6,
    name: 'Pro Volleyball Arena',
    type: 'Volleyball',
    location: 'Beach Side',
    capacity: 150,
    pricePerHour: 70,
    status: 'Available',
    rating: 4.5,
    bookings: 134,
  },
];

const typeColors: Record<string, string> = {
  Football: 'bg-green-100 text-green-700 border-green-200',
  Basketball: 'bg-orange-100 text-orange-700 border-orange-200',
  Tennis: 'bg-blue-100 text-blue-700 border-blue-200',
  Swimming: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  Volleyball: 'bg-purple-100 text-purple-700 border-purple-200',
};

export function StadiumManagement() {
  const [filter, setFilter] = useState<string>('All');

  const filteredStadiums = filter === 'All' 
    ? stadiums 
    : stadiums.filter(s => s.type === filter);

  const types = ['All', ...Array.from(new Set(stadiums.map(s => s.type)))];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-800">Stadium Management</h1>
        <p className="text-gray-600 mt-2">Manage all sports facilities and venues</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Stadiums</p>
                <p className="text-gray-900 mt-1">24</p>
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
                <p className="text-gray-600 text-sm">Available Now</p>
                <p className="text-gray-900 mt-1">18</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Capacity</p>
                <p className="text-gray-900 mt-1">8,450</p>
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
                <p className="text-gray-600 text-sm">Avg. Rating</p>
                <p className="text-gray-900 mt-1">4.7</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Add Button */}
      <div className="flex flex-wrap gap-4 mb-6">
        {types.map((type) => (
          <Button
            key={type}
            variant={filter === type ? 'default' : 'outline'}
            onClick={() => setFilter(type)}
            className={filter === type ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            {type}
          </Button>
        ))}
        <Button className="ml-auto bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Stadium
        </Button>
      </div>

      {/* Stadium Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStadiums.map((stadium) => (
          <Card key={stadium.id} className="shadow-sm hover:shadow-md transition-shadow">
            <div className="h-40 bg-gradient-to-br from-blue-100 to-blue-200 rounded-t-lg" />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{stadium.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={typeColors[stadium.type] || typeColors.Football}>
                      {stadium.type}
                    </Badge>
                    <Badge className={
                      stadium.status === 'Available' ? 'bg-green-100 text-green-700 border-green-200' :
                      stadium.status === 'Booked' ? 'bg-red-100 text-red-700 border-red-200' :
                      'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }>
                      {stadium.status}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit Stadium</DropdownMenuItem>
                    <DropdownMenuItem>View Bookings</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{stadium.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Capacity: {stadium.capacity}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">${stadium.pricePerHour}/hour</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{stadium.rating}</span>
                  </div>
                  <span className="text-sm text-gray-600">{stadium.bookings} bookings</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}