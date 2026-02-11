import { useEffect, useState } from 'react';
import { Search, AlertTriangle, Package, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InventoryAdmin() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching inventory data
    setTimeout(() => {
      setProducts([
        { _id: '1', name: 'Product A', sku: 'SKU-001', stock: 45, lowStockThreshold: 10, category: 'Electronics' },
        { _id: '2', name: 'Product B', sku: 'SKU-002', stock: 8, lowStockThreshold: 10, category: 'Electronics' },
        { _id: '3', name: 'Product C', sku: 'SKU-003', stock: 120, lowStockThreshold: 10, category: 'Clothing' },
        { _id: '4', name: 'Product D', sku: 'SKU-004', stock: 0, lowStockThreshold: 10, category: 'Clothing' },
        { _id: '5', name: 'Product E', sku: 'SKU-005', stock: 5, lowStockThreshold: 10, category: 'Accessories' },
        { _id: '6', name: 'Product F', sku: 'SKU-006', stock: 200, lowStockThreshold: 10, category: 'Accessories' },
        { _id: '7', name: 'Product G', sku: 'SKU-007', stock: 3, lowStockThreshold: 10, category: 'Electronics' },
        { _id: '8', name: 'Product H', sku: 'SKU-008', stock: 95, lowStockThreshold: 10, category: 'Clothing' },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const getStockStatus = (product) => {
    if (product.stock === 0) {
      return { text: 'Out of Stock', color: 'text-danger-600 bg-danger-50', icon: <AlertTriangle className="h-4 w-4" /> };
    } else if (product.stock <= product.lowStockThreshold) {
      return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-50', icon: <Package className="h-4 w-4" /> };
    } else {
      return { text: 'In Stock', color: 'text-success-600 bg-success-50', icon: <TrendingUp className="h-4 w-4" /> };
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ||
                          (filter === 'low' && product.stock <= product.lowStockThreshold) ||
                          (filter === 'out' && product.stock === 0);
    return matchesSearch && matchesFilter;
  });

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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Inventory Management</h1>

      {/* Search and Filter */}
      <div className="card p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
              className="input pl-10"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input"
          >
            <option value="all">All Products</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Total Products</p>
          <p className="text-3xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Low Stock Items</p>
          <p className="text-3xl font-bold text-yellow-600">
            {products.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0).length}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Out of Stock</p>
          <p className="text-3xl font-bold text-danger-600">
            {products.filter(p => p.stock === 0).length}
          </p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Threshold</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-600">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = getStockStatus(product);
                  return (
                    <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {product.images && product.images[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <span className="font-medium text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{product.sku}</td>
                      <td className="py-3 px-4 text-gray-600">{product.category}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{product.stock}</td>
                      <td className="py-3 px-4 text-gray-600">{product.lowStockThreshold}</td>
                      <td className="py-3 px-4">
                        <span className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.icon}
                          <span>{status.text}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-primary-600 hover:text-primary-700 font-medium">
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
