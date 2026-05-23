/**
 * API Client Service
 * 
 * WHY THIS MATTERS:
 * ==================
 * Centralizing API calls in one place makes our code:
 * 1. Easier to maintain - change API URLs in one place
 * 2. Easier to test - mock this file instead of Axios everywhere
 * 3. Consistent - same error handling, interceptors everywhere
 * 4. Scalable - add auth, logging, rate limiting here once
 * 
 * CONCEPT:
 * This is called the "API Layer" or "Service Layer" pattern.
 * It abstracts HTTP details from React components.
 * 
 * INTERVIEW PERSPECTIVE:
 * "I separated concerns by creating a dedicated service layer for all API calls.
 *  This makes the app more maintainable and testable since components don't 
 *  directly depend on HTTP implementation details."
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dummyjson.com';

/**
 * Create Axios instance with common configuration
 * This instance is reused across all API calls
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

/**
 * Request interceptor - runs before every API call
 * Could add auth tokens, request logging here
 */
apiClient.interceptors.request.use(
  (config) => {
    // You could add auth token here:
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - runs after every API response
 * Handle errors, log, refresh tokens, etc.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Could implement global error handling here
    // e.g., redirect to login if 401, show toast for errors, etc.
    console.error('API Error:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

/**
 * PRODUCTS API ENDPOINTS
 * These functions wrap Axios calls in a predictable interface
 * 
 * WHY FUNCTIONS INSTEAD OF DIRECT AXIOS CALLS?
 * 1. Single source of truth for endpoints
 * 2. Easier to change (backend URL changes in one place)
 * 3. Easier to add logic (filtering, sorting, caching)
 * 4. Type-safe if you use TypeScript
 */

export const productService = {
  /**
   * Get all products with optional filters and pagination
   * 
   * Query Parameters:
   * - limit: items per page
   * - skip: number of items to skip
   * - select: which fields to return
   */
  getAllProducts: (params = {}) => {
    return apiClient.get('/products', { params });
  },

  /**
   * Search products by query string
   * dummyjson.com searches across product title and description
   */
  searchProducts: (query, params = {}) => {
    return apiClient.get(`/products/search`, {
      params: { q: query, ...params },
    });
  },

  /**
   * Get single product by ID
   * Used in product details page
   */
  getProductById: (id) => {
    return apiClient.get(`/products/${id}`);
  },

  /**
   * Get all available categories
   * Used for category filter dropdown
   */
  getCategories: () => {
    return apiClient.get('/products/categories');
  },

  /**
   * Get products filtered by category
   * dummyjson.com endpoint for category filtering
   */
  getProductsByCategory: (category, params = {}) => {
    return apiClient.get(`/products/category/${category}`, { params });
  },
};

export default apiClient;
