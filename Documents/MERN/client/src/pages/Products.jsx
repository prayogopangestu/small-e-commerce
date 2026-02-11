import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/productService';
import { ShoppingCart, Heart } from 'lucide-react';
import useCart from '../hooks/useCart';
import toast from 'react-hot-toast';

export default function Products() {
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = Object.fromEntries(searchParams);
        const response = await getProducts(params);
        setProducts(response.data.products);
        setPagination(response.data.pagination);
      } catch (error) {
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Products</h1>

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
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No products found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
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
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary-600">
                      ${product.price.toFixed(2)}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        disabled={!product.inStock}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {!product.inStock && (
                    <p className="text-danger-600 text-sm font-medium mt-2">Out of Stock</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', page);
                    window.location.search = params.toString();
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    pagination.currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
