import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProducts } from '../services/productService';
import { ShoppingCart, Heart } from 'lucide-react';
import useCart from '../hooks/useCart';
import toast from 'react-hot-toast';

export default function Home() {
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await getFeaturedProducts(8);
        setFeaturedProducts(response.data.products);
      } catch (error) {
        toast.error('Failed to load featured products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-12 text-white mb-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to MERN Shop
          </h1>
          <p className="text-lg mb-8 opacity-90">
            Discover amazing products at unbeatable prices. Shop now and enjoy free shipping on orders over $50.
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium">
            View All
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product._id} className="card overflow-hidden group">
                <Link to={`/products/${product._id}`}>
                  <div className="relative">
                    {product.images && product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    {product.isFeatured && (
                      <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded">
                        Featured
                      </span>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      {product.compareAtPrice && (
                        <span className="text-gray-400 line-through text-sm mr-2">
                          ${product.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-xl font-bold text-primary-600">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        disabled={!product.inStock}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                      <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                        <Heart className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  {!product.inStock && (
                    <p className="text-danger-600 text-sm font-medium">Out of Stock</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
