import { useEffect, useState } from 'react';
import { Search, Mail, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomersAdmin() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching customers
    setTimeout(() => {
      setCustomers([
        { _id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', registeredAt: '2024-01-15', totalOrders: 5, totalSpent: 245.00 },
        { _id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', registeredAt: '2024-01-20', totalOrders: 3, totalSpent: 189.50 },
        { _id: '3', firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', registeredAt: '2024-02-01', totalOrders: 8, totalSpent: 567.25 },
        { _id: '4', firstName: 'Alice', lastName: 'Williams', email: 'alice@example.com', registeredAt: '2024-02-05', totalOrders: 2, totalSpent: 125.00 },
        { _id: '5', firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com', registeredAt: '2024-02-10', totalOrders: 12, totalSpent: 890.75 },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredCustomers = customers.filter((customer) =>
    `${customer.firstName} ${customer.lastName} ${customer.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="card p-6">
            <div className="bg-gray-200 h-6 w-1/4 rounded mb-4"></div>
            <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Customers</h1>

      {/* Search Bar */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={handleSearch}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Registered</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Orders</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Spent</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-600">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                          {customer.firstName[0]}
                        </div>
                        <span className="font-medium text-gray-900">
                          {customer.firstName} {customer.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {customer.email}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(customer.registeredAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{customer.totalOrders}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      ${customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-primary-600 hover:text-primary-700 font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
