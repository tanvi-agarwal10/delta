/**
 * PRODUCTS TABLE COMPONENT
 * 
 * WHAT IT DOES:
 * =============
 * Displays products in a table with:
 * - Search functionality (debounced)
 * - Category filtering
 * - Sorting
 * - Pagination
 * - URL state synchronization
 * 
 * CONCEPT: URL AS STATE
 * ====================
 * Instead of storing filters in component state, we store them in the URL:
 * /products?search=phone&category=smartphones&sort=price&page=1
 * 
 * BENEFITS:
 * 1. Shareable links - copy URL, share filtered view with others
 * 2. Bookmarkable - save filtered view in bookmarks
 * 3. Back button works - browser back returns to previous filters
 * 4. Refreshable - reload page keeps same filters
 * 
 * CHALLENGE: React state doesn't automatically sync with URL
 * SOLUTION: useSearchParams hook keeps them in sync
 * 
 * HOW IT WORKS:
 * 1. Component reads URL params with useSearchParams
 * 2. When filter changes, update URL params
 * 3. URL change triggers re-fetch of data
 * 4. User sees new data
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronUp, ChevronDown, Loader } from 'lucide-react';
import { productService } from '../../services/api';
import { useDebounce } from '../../utils/debounce';
import { formatPrice, getStockStatus, formatRating } from '../../utils/formatters';

/**
 * ProductsTable Component
 * 
 * Uses useSearchParams to manage filters via URL
 * This is a best practice for filterable tables
 */
export const ProductsTable = () => {
  // URL parameter management
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extract values from URL with defaults
  const search = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'name';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const itemsPerPage = 10;

  // Local state for search input (not in URL yet - gets debounced to URL)
  const [searchInput, setSearchInput] = useState(search);

  // Debounced search - only updates URL after user stops typing
  const debouncedSearch = useDebounce((value) => {
    setSearchParams((params) => {
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      params.set('page', '1'); // Reset to page 1 on new search
      return params;
    });
  }, 300); // Wait 300ms after user stops typing

  // When search input changes, debounce the URL update
  useEffect(() => {
    debouncedSearch(searchInput);
  }, [searchInput, debouncedSearch]);

  // Fetch categories for filter dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
    select: (response) => response.data,
  });

  /**
   * FETCH PRODUCTS DATA
   * 
   * WHAT REACT QUERY DOES:
   * - Caches data so we don't fetch on every render
   * - Handles loading/error states
   * - Automatic retries on failure
   * - Can refetch data when parameters change (dependencies)
   * 
   * WHY NOT JUST USE AXIOS?
   * React Query handles:
   * - Loading state
   * - Error handling
   * - Cache invalidation
   * - Refetching
   * Without React Query, you'd need useState + useEffect for all this
   */
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', search, categoryFilter, sortBy, currentPage],
    queryFn: async () => {
      // If category selected, fetch from category endpoint
      if (categoryFilter) {
        const response = await productService.getProductsByCategory(
          categoryFilter,
          {
            limit: itemsPerPage,
            skip: (currentPage - 1) * itemsPerPage,
          }
        );
        return response.data;
      }

      // If search query, use search endpoint
      if (search) {
        const response = await productService.searchProducts(search, {
          limit: itemsPerPage,
          skip: (currentPage - 1) * itemsPerPage,
        });
        return response.data;
      }

      // Default: fetch all products
      const response = await productService.getAllProducts({
        limit: itemsPerPage,
        skip: (currentPage - 1) * itemsPerPage,
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  /**
   * SORT DATA CLIENT-SIDE
   * 
   * WHY SORT ON CLIENT?
   * The API doesn't have sort parameter, so we do it in JS
   * Alternative: could have backend handle sorting
   * 
   * CHALLENGE: Sort after fetch, but useMemo prevents unnecessary resorts
   */
  const sortedProducts = useMemo(() => {
    if (!productsData?.products) return [];

    const products = [...productsData.products]; // Copy array (don't mutate original)

    // Sort based on selected sort option
    products.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return products;
  }, [productsData?.products, sortBy]);

  /**
   * UPDATE URL PARAMETERS
   * These functions change URL params, which triggers re-fetch
   */
  const handleCategoryChange = useCallback((newCategory) => {
    setSearchParams((params) => {
      if (newCategory) {
        params.set('category', newCategory);
      } else {
        params.delete('category');
      }
      params.set('page', '1');
      return params;
    });
  }, [setSearchParams]);

  const handleSortChange = useCallback((newSort) => {
    setSearchParams((params) => {
      params.set('sort', newSort);
      return params;
    });
  }, [setSearchParams]);

  const handlePageChange = useCallback((newPage) => {
    setSearchParams((params) => {
      params.set('page', newPage.toString());
      return params;
    });
  }, [setSearchParams]);

  // Calculate pagination
  const totalPages = Math.ceil((productsData?.total || 0) / itemsPerPage);

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="glass-card p-4 space-y-4">
        {/* Search and category filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400/50 transition-colors"
              aria-label="Search products"
            />
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-400/50 transition-colors"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categoriesData?.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* Sort select */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-400/50 transition-colors"
            aria-label="Sort products"
          >
            <option value="name">Sort by Name</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
      </div>

      {/* Table container */}
      <div className="glass-card overflow-hidden">
        {/* Loading state */}
        {isLoading && (
          <div className="p-8 text-center">
            <Loader className="inline animate-spin text-indigo-400" size={32} />
            <p className="text-gray-400 mt-2">Loading products...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-8 text-center text-red-400">
            <p>Error loading products. Please try again.</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && (
          <>
            {/* Responsive table - horizontal scroll on mobile */}
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table header */}
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Rating
                    </th>
                  </tr>
                </thead>

                {/* Table body */}
                <tbody className="divide-y divide-white/5">
                  {sortedProducts.length > 0 ? (
                    sortedProducts.map((product) => {
                      const stockStatus = getStockStatus(product.stock);
                      return (
                        <tr
                          key={product.id}
                          className="hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          {/* Product name */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {/* Product image */}
                              <img
                                src={product.thumbnail}
                                alt={product.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                              <span className="text-white font-medium truncate">
                                {product.title}
                              </span>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3 text-gray-400 capitalize">
                            {product.category}
                          </td>

                          {/* Price */}
                          <td className="px-4 py-3 text-white font-medium">
                            {formatPrice(product.price)}
                          </td>

                          {/* Stock */}
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${stockStatus.color} ${stockStatus.bgColor}`}
                            >
                              {stockStatus.status}
                            </span>
                          </td>

                          {/* Rating */}
                          <td className="px-4 py-3 text-white">
                            ⭐ {formatRating(product.rating)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-4 border-t border-white/10">
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-white/10 text-gray-400 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  Previous
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded transition-colors ${
                        page === currentPage
                          ? 'bg-indigo-500 text-white'
                          : 'border border-white/10 text-gray-400 hover:bg-white/5'
                      }`}
                      aria-current={page === currentPage ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  ))}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border border-white/10 text-gray-400 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
