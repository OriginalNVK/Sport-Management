import { useState } from 'react';
import { Wrench, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const services = [
  {
    id: 1,
    name: 'Equipment Rental',
    description: 'Rent sports equipment including balls, nets, and protective gear',
    category: 'Rental',
    price: 25,
    available: true,
    bookings: 156,
  },
  {
    id: 2,
    name: 'Personal Trainer',
    description: 'One-on-one training sessions with certified trainers',
    category: 'Training',
    price: 80,
    available: true,
    bookings: 89,
  },
  {
    id: 3,
    name: 'Photography Service',
    description: 'Professional sports photography for events and games',
    category: 'Media',
    price: 150,
    available: true,
    bookings: 45,
  },
  {
    id: 4,
    name: 'Catering Service',
    description: 'Food and beverage catering for events',
    category: 'Food & Beverage',
    price: 200,
    available: true,
    bookings: 67,
  },
  {
    id: 5,
    name: 'First Aid Team',
    description: 'On-site medical support and first aid services',
    category: 'Medical',
    price: 120,
    available: true,
    bookings: 34,
  },
  {
    id: 6,
    name: 'Live Streaming',
    description: 'Professional live streaming and broadcasting services',
    category: 'Media',
    price: 300,
    available: false,
    bookings: 23,
  },
  {
    id: 7,
    name: 'Cleaning Service',
    description: 'Post-event cleaning and maintenance',
    category: 'Maintenance',
    price: 100,
    available: true,
    bookings: 112,
  },
  {
    id: 8,
    name: 'Security Team',
    description: 'Professional security personnel for events',
    category: 'Security',
    price: 180,
    available: true,
    bookings: 78,
  },
];

const categories = ['All', 'Rental', 'Training', 'Media', 'Food & Beverage', 'Medical', 'Maintenance', 'Security'];

const categoryColors: Record<string, string> = {
  Rental: 'bg-blue-100 text-blue-700 border-blue-200',
  Training: 'bg-green-100 text-green-700 border-green-200',
  Media: 'bg-purple-100 text-purple-700 border-purple-200',
  'Food & Beverage': 'bg-orange-100 text-orange-700 border-orange-200',
  Medical: 'bg-red-100 text-red-700 border-red-200',
  Maintenance: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Security: 'bg-gray-800 text-white border-gray-700',
};

export function ServiceManagement() {
  const [filter, setFilter] = useState('All');

  const filteredServices = filter === 'All' 
    ? services 
    : services.filter(s => s.category === filter);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-800">Service Management</h1>
        <p className="text-gray-600 mt-2">Manage additional services and amenities</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Services</p>
                <p className="text-gray-900 mt-1">32</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Services</p>
                <p className="text-gray-900 mt-1">28</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <Wrench className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Bookings</p>
                <p className="text-gray-900 mt-1">604</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                <Wrench className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Revenue</p>
                <p className="text-gray-900 mt-1">$68,420</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <Wrench className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Add Button */}
      <div className="flex flex-wrap gap-3 mb-6">
        {categories.map((category) => (
          <Button
            key={category}
            variant={filter === category ? 'default' : 'outline'}
            onClick={() => setFilter(category)}
            className={filter === category ? 'bg-blue-600 hover:bg-blue-700' : ''}
            size="sm"
          >
            {category}
          </Button>
        ))}
        <Button className="ml-auto bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredServices.map((service) => (
          <Card key={service.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Wrench className="w-6 h-6 text-blue-600" />
                </div>
                <Badge className={service.available 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-200'
                }>
                  {service.available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
              <CardTitle className="text-lg">{service.name}</CardTitle>
              <Badge className={categoryColors[service.category]}>
                {service.category}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">{service.description}</p>
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-gray-900">${service.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Bookings</p>
                  <p className="text-gray-900">{service.bookings}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}