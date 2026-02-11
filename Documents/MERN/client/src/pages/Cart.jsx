import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, fetchCart, updateCartItem, removeFromCart, getCartTotal } = useCart();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (itemId, quantity) => {
    try {
      await updateCartItem(itemId, quantity);
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    if (cart && cart.items.length > 0) {
      navigate('/checkout');
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started</p>
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item._id} className="card p-4">
              <div className="flex items-start space-x-4">
                {item.productId.images && item.productId.images[0] && (
                  <Link to={`/products/${item.productId._id}`}>
                    <img
                      src={item.productId.images[0]}
                      alt={item.productId.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </Link>
                )}
                <div className="flex-1">
                  <Link to={`/products/${item.productId._id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
                      {item.productId.name}
                    </h3>
                  </Link>
                  <p className="text-primary-600 font-bold mb-3">
                    ${item.price.toFixed(2)}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-100 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3 py-1 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">${cart.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${cart.tax.toFixed(2)}</span>
              </div>
              {cart.couponDiscount > 0 && (
                <div className="flex justify-between text-success-600">
                  <span>Discount</span>
                  <span className="font-medium">-${cart.couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <hr className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-600">${(cart.subtotal + cart.shippingCost + cart.tax - cart.couponDiscount).toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="btn btn-primary w-full"
            >
              Proceed to Checkout
            </button>
            <Link to="/products" className="btn btn-secondary w-full mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
