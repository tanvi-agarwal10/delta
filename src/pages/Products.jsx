/**
 * PRODUCTS PAGE - Main Component
 * 
 * WHAT IT DOES:
 * =============
 * Displays a data table of products from dummyjson.com
 * Features:
 * - Search with debouncing
 * - Filter by category
 * - Sort by name/rating/price
 * - Pagination
 * - URL synchronization (state persists in URL)
 * 
 * WHAT PROBLEM DOES THIS SOLVE?
 * =============================
 * Users need to:
 * 1. Find specific products (search)
 * 2. Browse by type (filtering)
 * 3. Sort to find best/cheapest (sorting)
 * 4. Navigate large lists (pagination)
 * 5. Share/bookmark filtered results (URL sync)
 * 
 * This component provides all that.
 * 
 * WHY THIS ARCHITECTURE?
 * =====================
 * - Data fetching logic: handled by ProductsTable component
 * - Table rendering: handled by ProductTable component
 * - This page: just composes and layouts
 * - Separation of concerns: easier to maintain and test
 */

import React from 'react';
import { ProductsTable } from '../components/products/ProductsTable';

export const Products = () => {
  return (
    <div className="min-h-screen bg-dark-900 p-6 md:p-8">
      <div className="max-w-full mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
          <p className="text-gray-400">Browse and manage your product catalog</p>
        </div>

        {/* Products table component */}
        <ProductsTable />
      </div>
    </div>
  );
};

