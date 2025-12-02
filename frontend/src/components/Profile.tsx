import { useState } from 'react';
import { Mail, Phone, MapPin, Building2, Calendar, Edit, Save, User as UserIcon, Edit2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import type { UserRole } from '../App';

interface ProfileProps {
  userEmail: string;
  userRole: UserRole;
}

export function Profile({ userEmail, userRole }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userRole === 'customer' ? 'John Doe' : 'Admin User',
    email: userEmail,
    phone: userRole === 'customer' ? '+1 (555) 123-4567' : '+1 234 567 8900',
    address: userRole === 'customer' ? '123 Main Street, New York, NY 10001' : '123 Sports Avenue, New York, NY 10001',
    memberSince: '2024-01-15',
    favoriteSport: userRole === 'customer' ? 'Football' : 'N/A',
    department: userRole === 'manager' ? 'Management' : 'N/A',
    bio: userRole === 'manager' 
      ? 'Experienced sports facility manager with over 10 years of experience in managing sports complexes and stadiums.'
      : 'Sports enthusiast and regular customer.',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Customer Profile View
  if (userRole === 'customer') {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-gray-800">My Profile</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="max-w-3xl">
          {/* Profile Avatar */}
          <div className="flex items-center gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-gray-900">{formData.name}</h2>
              <p className="text-gray-600">Member since {formData.memberSince}</p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <h3 className="mb-6 text-gray-800">Personal Information</h3>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-gray-600 mb-2">
                  <UserIcon className="w-4 h-4" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-gray-600 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-gray-600 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.phone}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.address}</p>
                )}
              </div>

              {/* Favorite Sport */}
              <div>
                <label className="flex items-center gap-2 text-gray-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  Favorite Sport
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="favoriteSport"
                    value={formData.favoriteSport}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.favoriteSport}</p>
                )}
              </div>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="border border-gray-200 rounded-lg p-6 bg-white text-center">
              <p className="text-gray-600 mb-2">Total Bookings</p>
              <p className="text-3xl text-gray-900">24</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 bg-white text-center">
              <p className="text-gray-600 mb-2">Active Sessions</p>
              <p className="text-3xl text-gray-900">3</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 bg-white text-center">
              <p className="text-gray-600 mb-2">Services Used</p>
              <p className="text-3xl text-gray-900">8</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Manager Profile View
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-800">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mb-4">
                <span className="text-3xl">AD</span>
              </div>
              <h2 className="text-gray-900 mb-1">Admin User</h2>
              <p className="text-gray-600 mb-4">System Administrator</p>
              <Button variant="outline" className="w-full mb-2">
                <Edit className="w-4 h-4 mr-2" />
                Change Photo
              </Button>
              <div className="w-full border-t pt-4 mt-4 space-y-3">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Mail className="w-4 h-4" />
                  <span>admin@sporthub.com</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>+1 234 567 8900</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>New York, USA</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Joined Nov 2024</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="Admin" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="User" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="admin@sporthub.com" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" defaultValue="+1 234 567 8900" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" defaultValue="System Administrator" className="mt-2" disabled />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" defaultValue="Management" className="mt-2" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue="123 Sports Avenue, New York, NY 10001" className="mt-2" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  defaultValue="Experienced sports facility manager with over 10 years of experience in managing sports complexes and stadiums." 
                  className="mt-2"
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Stats */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-700">Bookings Managed</span>
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-blue-900">1,247</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-700">Users Managed</span>
                  <Building2 className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-green-900">2,543</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-700">Stadiums Managed</span>
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-purple-900">24</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-orange-700">Total Revenue</span>
                  <Building2 className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-orange-900">$124,500</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" placeholder="Enter current password" className="mt-2" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" placeholder="Enter new password" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Confirm new password" className="mt-2" />
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preferences */}
      <Card className="shadow-sm mt-6">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: 'Email notifications for new bookings', checked: true },
              { label: 'SMS alerts for urgent matters', checked: true },
              { label: 'Weekly performance reports', checked: false },
              { label: 'Marketing and promotional emails', checked: false },
            ].map((pref, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-900">{pref.label}</span>
                <input
                  type="checkbox"
                  defaultChecked={pref.checked}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}