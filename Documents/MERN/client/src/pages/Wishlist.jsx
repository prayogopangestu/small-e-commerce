import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist, moveToCart } from '../services/wishlistService';
import { ShoppingCart, Heart, Trash2 } from 'lucide-react';
import useCart from '../hooks/useCart';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await getWishlist();
        setWishlist(response.data.wishlist);
      } catch (error) {
        toast.error('Failed to load wishlist');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setWishlist((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.productId._id !== productId),
      }));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      await moveToCart(productId);
      setWishlist((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.productId._id !== productId),
      }));
      toast.success('Moved to cart');
    } catch (error) {
      toast.error('Failed to move to cart');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart({
        productId: product._id,
        quantity: 1,
      });
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>

      {!wishlist || wishlist.items.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Save items you love to your wishlist
          </p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.items.map((item) => (
            <div key={item._id} className="card overflow-hidden group">
              <div className="relative">
                <Link to={`/products/${item.productId._id}`}>
                  {item.productId.images && item.productId.images[0] && (
                    <img
                      src={item.productId.images[0]}
                      alt={item.productId.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </Link>
                <button
                  onClick={() => handleRemoveFromWishlist(item.productId._id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div className="p-4">
                <Link to={`/products/${item.productId._id}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                    {item.productId.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-primary-600">
                    ${item.productId.price.toFixed(2)}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleAddToCart(item.productId)}
                      className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      disabled={!item.productId.inStock}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMoveToCart(item.productId._id)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Heart className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                {!item.productId.inStock && (
                  <p className="text-danger-600 text-sm font-medium">Out of Stock</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
