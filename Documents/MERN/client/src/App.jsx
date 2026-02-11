import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ProductsAdmin from './pages/admin/ProductsAdmin';
import OrdersAdmin from './pages/admin/OrdersAdmin';
import CustomersAdmin from './pages/admin/CustomersAdmin';
import AnalyticsAdmin from './pages/admin/AnalyticsAdmin';
import InventoryAdmin from './pages/admin/InventoryAdmin';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<Profile />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/products" element={<ProductsAdmin />} />
            <Route path="/admin/orders" element={<OrdersAdmin />} />
            <Route path="/admin/customers" element={<CustomersAdmin />} />
            <Route path="/admin/analytics" element={<AnalyticsAdmin />} />
            <Route path="/admin/inventory" element={<InventoryAdmin />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
