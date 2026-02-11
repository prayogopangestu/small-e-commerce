import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderById } from '../services/orderService';
import { Package, CheckCircle, Clock, XCircle, MapPin } from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const response = await getOrderById(id);
        setOrder(response.data.order);
      } catch (error) {
        console.error('Failed to load order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-success-600" />;
      case 'shipped':
        return <Package className="h-5 w-5 text-primary-600" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-danger-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="card p-6">
            <div className="bg-gray-200 h-6 w-1/4 rounded mb-4"></div>
            <div className="bg-gray-200 h-4 w-1/2 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 w-1/3 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Details</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {order.orderNumber}
                </h2>
                <p className="text-sm text-gray-600">
                  Placed on{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(order.status)}
                <span className="capitalize font-medium">{order.status}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex items-start space-x-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    ${item.totalPrice.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Shipping Address
            </h3>
            <div className="flex items-start space-x-2">
              <MapPin className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="font-medium text-gray-900">
                  {order.shippingAddress.street}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.country}
                </p>
                <p className="text-sm text-gray-600">
                  Phone: {order.shippingAddress.phone}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Order Summary
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">${order.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${order.tax.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success-600">
                  <span>Discount</span>
                  <span className="font-medium">-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <hr className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-600">${order.total.toFixed(2)}</span>
              </div>
            </div>
            {order.trackingNumber && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                <p className="font-medium text-gray-900">{order.trackingNumber}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
