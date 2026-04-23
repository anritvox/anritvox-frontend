// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Protect route
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'overview', label: 'Account Overview', icon: '👤' },
    { id: 'orders', label: 'Orders & Tracking', icon: '📦' },
    { id: 'warranty', label: 'E-Warranty Vault', icon: '🛡️' },
    { id: 'returns', label: 'Returns & Exchanges', icon: '🔄' },
    { id: 'addresses', label: 'Address Book', icon: '📍' },
    { id: 'wishlist', label: 'My Wishlist', icon: '❤️' },
    { id: 'reviews', label: 'My Reviews', icon: '⭐' },
    { id: 'coupons', label: 'Coupon Wallet', icon: '🎟️' },
    { id: 'tickets', label: 'Support Tickets', icon: '🎧' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Account Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 p-4 rounded border">
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-semibold text-lg">{user?.name || 'Customer'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded border">
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-semibold text-lg">{user?.email}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded border">
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-semibold text-lg">{user?.phone || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded border">
                <p className="text-sm text-gray-500">Account Type</p>
                <p className="font-semibold text-lg capitalize">{user?.role || 'Standard'}</p>
              </div>
            </div>
            <button className="mt-4 bg-[#39d353] text-white px-4 py-2 rounded hover:bg-[#2db844] transition-colors">
              Edit Profile Details
            </button>
          </div>
        );
      case 'orders':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Orders & Tracking</h2>
            <div className="mt-6 text-center text-gray-500 py-10 bg-gray-50 rounded border border-dashed">
              <p>No active orders found.</p>
              <button className="mt-2 text-[#39d353] hover:underline" onClick={() => navigate('/shop')}>
                Browse Accessories
              </button>
            </div>
          </div>
        );
      case 'warranty':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">E-Warranty Vault</h2>
            <p className="text-sm text-gray-600 mt-2">Register your electronics (Basstubes, LEDs, etc.) using the serial number on the box.</p>
            <div className="mt-4 p-4 border rounded bg-white shadow-sm flex items-center space-x-4">
              <input type="text" placeholder="Enter Serial Number (e.g., ANR-12345)" className="flex-1 border p-2 rounded focus:ring-[#39d353] outline-none" />
              <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">Register Product</button>
            </div>
          </div>
        );
      case 'returns':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Returns & Exchanges</h2>
            <div className="mt-6 text-center text-gray-500 py-10 bg-gray-50 rounded border border-dashed">
              <p>You have no active RMA requests.</p>
            </div>
          </div>
        );
      case 'addresses':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Address Book</h2>
            <button className="mt-4 border-2 border-dashed border-gray-300 w-full py-8 text-gray-500 rounded hover:border-[#39d353] hover:text-[#39d353] transition-colors">
              + Add New Shipping Address
            </button>
          </div>
        );
      case 'coupons':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Coupon Wallet</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Placeholder for complex coupon validation output */}
               <div className="border border-green-200 bg-green-50 p-4 rounded flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-green-800">WELCOME10</h3>
                    <p className="text-sm text-green-600">10% off your first accessory order</p>
                  </div>
                  <button className="bg-white border border-green-300 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-100">Copy</button>
               </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Security Settings</h2>
            <form className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input type="password" className="mt-1 w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#39d353]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" className="mt-1 w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#39d353]" />
              </div>
              <button type="button" className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700">
                Update Password
              </button>
            </form>
          </div>
        );
      default:
        return (
          <div className="text-center py-20 text-gray-400">
            <h2 className="text-xl">This feature is currently being provisioned.</h2>
          </div>
        );
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 bg-gray-50 border-b text-center">
                <div className="h-20 w-20 bg-[#39d353] rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-inner">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{user?.name}</h3>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
              <nav className="flex flex-col p-2 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center text-left px-4 py-3 rounded transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-gray-100 text-[#39d353] font-semibold' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3 text-lg">{tab.icon}</span>
                    <span className="text-sm">{tab.label}</span>
                  </button>
                ))}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-3 rounded text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="mr-3 text-lg">🚪</span>
                    <span className="text-sm font-medium">Secure Logout</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow p-6 min-h-[600px]">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
