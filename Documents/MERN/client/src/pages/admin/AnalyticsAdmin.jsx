import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Package, ShoppingCart } from 'lucide-react';

export default function AnalyticsAdmin() {
  const [period, setPeriod] = useState('week');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0,
  });
  const [topProducts, setTopProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching analytics data
    setTimeout(() => {
      setStats({
        totalRevenue: 24580,
        totalOrders: 156,
        totalCustomers: 89,
        averageOrderValue: 157.56,
        conversionRate: 3.2,
        revenueChange: 8,
        ordersChange: 12,
        customersChange: 15,
      });
      setTopProducts([
        { name: 'Product A', sales: 45, revenue: 4500 },
        { name: 'Product B', sales: 38, revenue: 3800 },
        { name: 'Product C', sales: 32, revenue: 3200 },
        { name: 'Product D', sales: 28, revenue: 2800 },
        { name: 'Product E', sales: 25, revenue: 2500 },
      ]);
      setIsLoading(false);
    }, 1000);
  }, [period]);

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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="input"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-success-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-success-600" />
            </div>
            <span className={`flex items-center text-sm ${stats.revenueChange >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {stats.revenueChange >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {Math.abs(stats.revenueChange)}%
            </span>
          </div>
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-primary-600" />
            </div>
            <span className={`flex items-center text-sm ${stats.ordersChange >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {stats.ordersChange >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {Math.abs(stats.ordersChange)}%
            </span>
          </div>
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <span className={`flex items-center text-sm ${stats.customersChange >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {stats.customersChange >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {Math.abs(stats.customersChange)}%
            </span>
          </div>
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Avg Order Value</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">${stats.averageOrderValue.toFixed(2)}</p>
          <p className="text-sm text-success-600 mt-2">+5% from last period</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Products</h2>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.sales} sales</p>
                </div>
                <p className="font-bold text-primary-600">${product.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Chart Placeholder */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sales Trend</h2>
          <div className="h-64 bg-gray-50 rounded-lg flex items-end justify-between px-4 pb-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className="w-8 bg-primary-600 rounded-t"
                  style={{ height: `${30 + Math.random() * 70}%` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
