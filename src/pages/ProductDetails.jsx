/**
 * PRODUCT DETAILS PAGE
 * 
 * WHAT IT DOES:
 * =============
 * Shows detailed view of a single product including:
 * - Product image carousel (Swiper)
 * - Title, description
 * - Category, stock, rating
 * - Price
 * - Add to cart button (placeholder)
 * 
 * DYNAMIC ROUTING:
 * URL: /product/:id
 * Example: /product/123
 * 
 * HOW TO GET HERE:
 * From products table, click on a product row to navigate to details
 * 
 * WHAT PROBLEM DOES THIS SOLVE?
 * =============================
 * Users want to see detailed information about a product:
 * - Multiple images from different angles
 * - Full description
 * - Availability
 * - Reviews/rating
 * Before adding to cart or sharing
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { productService } from '../services/api';
import { formatPrice, formatRating, getStockStatus } from '../utils/formatters';
import { ArrowLeft, ShoppingCart, Share2, Heart } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

/**
 * ProductDetails Component
 * 
 * Uses useParams to get :id from URL
 * Then fetches that specific product from API
 */
export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  /**
   * FETCH PRODUCT DATA
   * React Query automatically caches this
   * If user navigates back and forth, data is already cached
   */
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id),
    select: (response) => response.data,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 p-6 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
          <p className="text-txt-secondary">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-dark-900 p-6 md:p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-accent-500 hover:text-accent-600 mb-8"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="glass-card p-8 text-center">
          <p className="text-red-400">Product not found</p>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock);

  return (
    <div className="min-h-screen bg-dark-900 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-accent-500 hover:text-accent-600 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Product content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Image carousel */}
          <div className="glass-card p-6 h-fit">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              className="w-full rounded-lg overflow-hidden"
            >
              {/* Main image */}
              <SwiperSlide>
                <img
                  src={product.images?.[0] || product.thumbnail}
                  alt={product.title}
                  className="w-full h-96 object-cover bg-dark-900"
                />
              </SwiperSlide>

              {/* Additional images */}
              {product.images?.slice(1).map((image, idx) => (
                <SwiperSlide key={idx}>
                  <img
                    src={image}
                    alt={`${product.title} ${idx + 2}`}
                    className="w-full h-96 object-cover bg-dark-900"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Thumbnail gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {product.images.slice(0, 4).map((image, idx) => (
                  <img
                    key={idx}
                    src={image}
                    alt="Thumbnail"
                    className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Product info */}
          <div className="space-y-6">
            {/* Category badge */}
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/30 text-accent-500 text-sm font-medium capitalize">
                {product.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white">{product.title}</h1>

            {/* Rating and reviews */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span className="text-lg font-medium text-white">{formatRating(product.rating)}</span>
                <span className="text-gray-400">({product.reviews?.length || 0} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="glass-card p-6 space-y-2">
              <p className="text-gray-400 text-sm">Price</p>
              <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text">
                {formatPrice(product.price)}
              </p>
              {product.discountPercentage > 0 && (
                <p className="text-red-400 text-sm">
                  {product.discountPercentage}% off
                </p>
              )}
            </div>

            {/* Stock status */}
            <div className="glass-card p-4">
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-medium ${stockStatus.color} ${stockStatus.bgColor}`}
              >
                {stockStatus.status} ({product.stock} in stock)
              </span>
            </div>

            {/* Description */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
              <p className="text-gray-400 leading-relaxed">{product.description}</p>
            </div>

            {/* Additional info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4">
                <p className="text-gray-400 text-sm mb-1">Brand</p>
                <p className="text-white font-medium">{product.brand || 'N/A'}</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-gray-400 text-sm mb-1">SKU</p>
                <p className="text-white font-medium">{product.sku || 'N/A'}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-6">
              {/* Quantity and Add to cart */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-dark-600 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-dark-700 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center bg-transparent border-l border-r border-dark-600 text-white"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-dark-700 transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button className="flex-1 btn-gradient py-3 rounded-lg font-medium flex items-center justify-center gap-2">
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
              </div>

              {/* Share and Favorite */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-dark-600 hover:bg-dark-700 transition-colors text-white"
                >
                  <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
                  {isFavorited ? 'Favorited' : 'Add to Favorites'}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-dark-600 hover:bg-dark-700 transition-colors text-white">
                  <Share2 size={20} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews section (placeholder for later) */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-12 pt-8 border-t border-dark-600">
            <h2 className="text-2xl font-bold text-white mb-6">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.reviews.slice(0, 3).map((review, idx) => (
                <div key={idx} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{review.reviewerName}</span>
                    <span className="text-yellow-400">⭐ {review.rating}</span>
                  </div>
                  <p className="text-sm text-gray-400">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
