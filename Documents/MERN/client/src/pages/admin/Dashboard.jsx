import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching dashboard stats
    setTimeout(() => {
      setStats({
        totalOrders: 156,
        totalRevenue: 24580,
        totalCustomers: 89,
        averageOrderValue: 157.56,
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="bg-gray-200 h-6 w-1/3 rounded mb-4"></div>
                <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-primary-600" />
            </div>
            <span className="text-sm text-gray-500">Total Orders</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
          <p className="text-sm text-success-600 mt-2">+12% from last month</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-success-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-success-600" />
            </div>
            <span className="text-sm text-gray-500">Total Revenue</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-success-600 mt-2">+8% from last month</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500">Total Customers</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
          <p className="text-sm text-success-600 mt-2">+15% from last month</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Avg Order Value</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">${stats.averageOrderValue.toFixed(2)}</p>
          <p className="text-sm text-danger-600 mt-2">-3% from last month</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Order #</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-900">ORD-20240211-0001</td>
                <td className="py-3 px-4 text-gray-600">John Doe</td>
                <td className="py-3 px-4 text-gray-600">Feb 11, 2024</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-success-50 text-success-600 rounded-full text-xs font-medium">
                    Delivered
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-medium text-gray-900">$125.00</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-900">ORD-20240211-0002</td>
                <td className="py-3 px-4 text-gray-600">Jane Smith</td>
                <td className="py-3 px-4 text-gray-600">Feb 11, 2024</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-medium">
                    Processing
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-medium text-gray-900">$89.99</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-900">ORD-20240211-0003</td>
                <td className="py-3 px-4 text-gray-600">Bob Johnson</td>
                <td className="py-3 px-4 text-gray-600">Feb 10, 2024</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-medium">
                    Shipped
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-medium text-gray-900">$234.50</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
