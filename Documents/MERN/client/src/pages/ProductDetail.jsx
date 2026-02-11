import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { ShoppingCart, Heart, Star, Minus, Plus } from 'lucide-react';
import useCart from '../hooks/useCart';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await getProductById(id);
        setProduct(response.data.product);
      } catch (error) {
        toast.error('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await addToCart({
        productId: product._id,
        quantity,
      });
      toast.success(`Added ${quantity} item(s) to cart`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="bg-gray-200 h-8 rounded"></div>
              <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
              <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
              <div className="bg-gray-200 h-12 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Product not found</p>
          <Link to="/products" className="btn btn-primary mt-4">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="card overflow-hidden">
            {product.images && product.images[0] && (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            )}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          {product.averageRating > 0 && (
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(product.averageRating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-gray-600">
                {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>
          )}

          <div className="mb-6">
            {product.compareAtPrice && (
              <span className="text-gray-400 line-through text-lg mr-2">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
            <span className="text-3xl font-bold text-primary-600">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {product.shortDescription && (
            <p className="text-gray-600 mb-6">{product.shortDescription}</p>
          )}

          {product.inStock ? (
            <p className="text-success-600 font-medium mb-6">In Stock</p>
          ) : (
            <p className="text-danger-600 font-medium mb-6">Out of Stock</p>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center mb-6">
            <span className="text-gray-700 mr-4">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="px-3 py-2 hover:bg-gray-100 transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 py-2 font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="px-3 py-2 hover:bg-gray-100 transition-colors"
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={handleAddToCart}
              className="btn btn-primary flex-1"
              disabled={!product.inStock}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </button>
            <button className="btn btn-secondary">
              <Heart className="h-5 w-5" />
            </button>
          </div>

          {/* Product Details */}
          {product.description && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
