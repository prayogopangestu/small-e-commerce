import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart';
import { createOrder } from '../services/orderService';
import { createPaymentIntent } from '../services/paymentService';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function Checkout() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [formData, setFormData] = useState({
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      phone: '',
    },
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      phone: '',
    },
    sameAsShipping: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');

    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value,
      },
    });
  };

  const handleSameAsShippingChange = (e) => {
    setFormData({
      ...formData,
      sameAsShipping: e.target.checked,
      billingAddress: e.target.checked ? formData.shippingAddress : formData.billingAddress,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create payment intent
      const total = cart.subtotal + cart.shippingCost + cart.tax - (cart.couponDiscount || 0);
      const paymentResponse = await createPaymentIntent(total);
      const { clientSecret, paymentIntentId } = paymentResponse.data;

      // Create order
      const orderResponse = await createOrder({
        items: cart.items.map(item => ({
          productId: item.productId._id,
          quantity: item.quantity,
        })),
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.sameAsShipping ? formData.shippingAddress : formData.billingAddress,
        paymentId: paymentIntentId,
      });

      // Process payment with Stripe
      const stripe = await stripePromise;
      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            // Card details would come from Stripe Elements
            number: '4242424242424242',
            exp_month: 12,
            exp_year: 2024,
            cvc: '123',
          },
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Order placed successfully!');
        navigate('/orders');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  name="shippingAddress.street"
                  type="text"
                  value={formData.shippingAddress.street}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    name="shippingAddress.city"
                    type="text"
                    value={formData.shippingAddress.city}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    name="shippingAddress.state"
                    type="text"
                    value={formData.shippingAddress.state}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    name="shippingAddress.zipCode"
                    type="text"
                    value={formData.shippingAddress.zipCode}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    name="shippingAddress.country"
                    type="text"
                    value={formData.shippingAddress.country}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  name="shippingAddress.phone"
                  type="tel"
                  value={formData.shippingAddress.phone}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="card p-6">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Billing Address</h2>
              <label className="flex items-center ml-4">
                <input
                  type="checkbox"
                  checked={formData.sameAsShipping}
                  onChange={handleSameAsShippingChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Same as shipping</span>
              </label>
            </div>
            {!formData.sameAsShipping && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    name="billingAddress.street"
                    type="text"
                    value={formData.billingAddress.street}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      name="billingAddress.city"
                      type="text"
                      value={formData.billingAddress.city}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      name="billingAddress.state"
                      type="text"
                      value={formData.billingAddress.state}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      name="billingAddress.zipCode"
                      type="text"
                      value={formData.billingAddress.zipCode}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      name="billingAddress.country"
                      type="text"
                      value={formData.billingAddress.country}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {cart.items.map((item) => (
                <div key={item._id} className="flex items-center space-x-3">
                  <img
                    src={item.productId.images?.[0]}
                    alt={item.productId.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">
                      {item.productId.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} x ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-medium">
                    ${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <hr className="my-4" />
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
                <span className="text-primary-600">
                  ${(cart.subtotal + cart.shippingCost + cart.tax - (cart.couponDiscount || 0)).toFixed(2)}
                </span>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading || isProcessing}
            >
              {isLoading || isProcessing ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
