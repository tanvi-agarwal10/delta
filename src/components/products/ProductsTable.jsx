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
 * - Column Customization (show/hide columns with LocalStorage memory)
 * - Drag-and-Drop Column Reordering (@dnd-kit/core with LocalStorage memory)
 * - Background Polling (updates every 30s) + Manual Refresh Button
 */

import { useState, useCallback, useEffect, useMemo, useRef, memo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader, Settings, RefreshCw } from 'lucide-react';
import { productService } from '../../services/api';
import { useDebounce } from '../../utils/debounce';
import { formatPrice, getStockStatus, formatRating } from '../../utils/formatters';

// DnD Kit Imports
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Default column layout metadata
const COLUMN_LABELS = {
  product: 'Product',
  category: 'Category',
  price: 'Price',
  stock: 'Stock',
  rating: 'Rating',
};

/**
 * Sortable Table Header Cell
 * Wrapped in useSortable hook to allow dragging left and right
 */
const SortableHeader = memo(({ id, label }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? 'grabbing' : 'grab',
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="text-left px-4 py-3.5 text-xs font-semibold text-txt-secondary uppercase tracking-wider hover:bg-dark-700 active:bg-accent-500/10 transition-colors select-none"
    >
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        <span className="text-[8px] text-accent-500 font-bold bg-accent-500/10 px-1 py-0.5 rounded">⋮⋮</span>
      </div>
    </th>
  );
});

SortableHeader.displayName = 'SortableHeader';

export const ProductsTable = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dropdownRef = useRef(null);

  // Extract values from URL with defaults
  const search = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'name';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const itemsPerPage = 10;

  // Local state for search input (debounced to URL)
  const [searchInput, setSearchInput] = useState(search);

  // Dropdown visibility for column settings
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Load / initialize column visibility and ordering from LocalStorage
  const [visibleColumnsMap, setVisibleColumnsMap] = useState(() => {
    const saved = localStorage.getItem('nova_visible_cols');
    return saved ? JSON.parse(saved) : {
      product: true,
      category: true,
      price: true,
      stock: true,
      rating: true,
    };
  });

  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('nova_col_order');
    return saved ? JSON.parse(saved) : ['product', 'category', 'price', 'stock', 'rating'];
  });

  // Persist column preferences to localStorage
  useEffect(() => {
    localStorage.setItem('nova_visible_cols', JSON.stringify(visibleColumnsMap));
  }, [visibleColumnsMap]);

  useEffect(() => {
    localStorage.setItem('nova_col_order', JSON.stringify(columnOrder));
  }, [columnOrder]);

  // Click-outside listener for columns dropdown settings
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowColumnMenu(false);
      }
    };
    if (showColumnMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColumnMenu]);

  // Debounced search - updates URL
  const debouncedSearch = useDebounce((value) => {
    setSearchParams((params) => {
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      params.set('page', '1'); // Reset to page 1
      return params;
    });
  }, 300);

  useEffect(() => {
    if (searchInput !== search) {
      debouncedSearch(searchInput);
    }
  }, [searchInput, search, debouncedSearch]);

  // Keep local search input synchronized with URL parameters during render (React recommended pattern)
  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    setSearchInput(search);
    setPrevSearch(search);
  }

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
    select: (response) => response.data,
  });

  // Fetch products data with 30s background polling
  const {
    data: productsData,
    isLoading,
    isPending,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products', search, categoryFilter, sortBy, currentPage],
    queryFn: async () => {
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

      if (search) {
        const response = await productService.searchProducts(search, {
          limit: itemsPerPage,
          skip: (currentPage - 1) * itemsPerPage,
        });
        return response.data;
      }

      const response = await productService.getAllProducts({
        limit: itemsPerPage,
        skip: (currentPage - 1) * itemsPerPage,
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchInterval: 30000, // Poll every 30 seconds
  });

  // Client-side sort
  const sortedProducts = useMemo(() => {
    if (!productsData || !productsData.products) return [];
    const products = [...productsData.products];

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
  }, [productsData, sortBy]);

  // Toggle column visibility handler
  const toggleColumn = (colName) => {
    setVisibleColumnsMap((prev) => {
      const next = { ...prev, [colName]: !prev[colName] };
      // Ensure at least one column is visible
      const anyVisible = Object.values(next).some(Boolean);
      return anyVisible ? next : prev;
    });
  };

  // DnD kit configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Allow regular click event triggers
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Compute ordered visible columns list
  const visibleColumns = useMemo(() => {
    return columnOrder.filter((col) => visibleColumnsMap[col]);
  }, [columnOrder, visibleColumnsMap]);

  // Handlers for selectors
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

  const totalPages = Math.ceil((productsData?.total || 0) / itemsPerPage);

  return (
    <div className="space-y-4">
      {/* Filter and options bar */}
      <div className="glass-card p-4 space-y-4 relative z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left search input with inline refresh */}
          <div className="relative flex-1 max-w-md flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-600 focus:outline-none focus:border-accent-500 transition-colors"
                aria-label="Search products"
              />
            </div>
            
            {/* Manual refresh button */}
            <button
              onClick={() => refetch()}
              title="Refresh products"
              className={`p-2.5 rounded-lg border border-dark-600 bg-dark-800 text-gray-400 hover:text-white hover:bg-dark-700 active:scale-95 transition-all ${
                isFetching ? 'animate-spin text-accent-500' : ''
              }`}
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Filters, sort & column customization */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:border-accent-500 transition-colors"
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {categoriesData?.map((category) => {
                const slug = typeof category === 'object' ? category.slug : category;
                const name = typeof category === 'object' ? category.name : (category.charAt(0).toUpperCase() + category.slice(1));
                return (
                  <option key={slug} value={slug}>
                    {name}
                  </option>
                );
              })}
            </select>

            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:border-accent-500 transition-colors"
              aria-label="Sort products"
            >
              <option value="name">Sort by Name</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rating</option>
            </select>

            {/* Column customizer dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white hover:bg-dark-700 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Settings size={15} className="text-accent-500" />
                <span>Columns</span>
              </button>

              {showColumnMenu && (
                <div className="absolute right-0 mt-2.5 w-48 bg-dark-800/95 backdrop-blur-xl border border-dark-600 rounded-xl shadow-2xl p-3.5 z-40 space-y-2.5 animate-in fade-in slide-in-from-top-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-accent-500/80 border-b border-dark-600 pb-1">
                    Show/Hide Columns
                  </p>
                  <div className="space-y-2">
                    {Object.keys(COLUMN_LABELS).map((col) => (
                      <label
                        key={col}
                        className="flex items-center gap-2.5 text-xs text-txt-secondary hover:text-white cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumnsMap[col]}
                          onChange={() => toggleColumn(col)}
                          className="rounded border-dark-600 bg-dark-800 text-accent-500 focus:ring-accent-500/40 w-3.5 h-3.5"
                        />
                        <span>{COLUMN_LABELS[col]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Table container */}
      <div className="glass-card overflow-hidden">
        {/* Loading overlay indicator */}
        {(isLoading || isPending || (!productsData && !error)) && (
          <div className="p-16 text-center">
            <Loader className="inline animate-spin text-indigo-400" size={32} />
            <p className="text-gray-400 mt-2 text-sm">Loading catalog items...</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-16 text-center text-red-400">
            <p className="text-sm font-semibold">Error loading products catalog details.</p>
          </div>
        )}

        {/* Dynamic Drag-and-Drop Table */}
        {!(isLoading || isPending || (!productsData && !error)) && !error && (
          <>
            <div className="overflow-x-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-600 bg-dark-900">
                      <SortableContext
                        items={visibleColumns}
                        strategy={horizontalListSortingStrategy}
                      >
                        {visibleColumns.map((colId) => (
                          <SortableHeader
                            key={colId}
                            id={colId}
                            label={COLUMN_LABELS[colId]}
                          />
                        ))}
                      </SortableContext>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-dark-600/50">
                    {sortedProducts.length > 0 ? (
                      sortedProducts.map((product) => {
                        const stockStatus = getStockStatus(product.stock);
                        return (
                          <tr
                            key={product.id}
                            onClick={() => navigate(`/product/${product.id}`)}
                            className="hover:bg-dark-700/50 transition-colors cursor-pointer"
                          >
                            {visibleColumns.map((colId) => {
                              switch (colId) {
                                case 'product':
                                  return (
                                    <td key="col-product" className="px-4 py-3">
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={product.thumbnail}
                                          alt={product.title}
                                          className="w-10 h-10 rounded-lg object-cover bg-dark-900 border border-dark-600"
                                        />
                                        <span className="text-white font-medium truncate max-w-[180px]">
                                          {product.title}
                                        </span>
                                      </div>
                                    </td>
                                  );
                                case 'category':
                                  return (
                                    <td key="col-category" className="px-4 py-3 text-gray-400 capitalize text-sm">
                                      {product.category}
                                    </td>
                                  );
                                case 'price':
                                  return (
                                    <td key="col-price" className="px-4 py-3 text-white font-semibold text-sm">
                                      {formatPrice(product.price)}
                                    </td>
                                  );
                                case 'stock':
                                  return (
                                    <td key="col-stock" className="px-4 py-3">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${stockStatus.color} ${stockStatus.bgColor}`}
                                      >
                                        {stockStatus.status}
                                      </span>
                                    </td>
                                  );
                                case 'rating':
                                  return (
                                    <td key="col-rating" className="px-4 py-3 text-white text-sm font-semibold">
                                      ⭐ {formatRating(product.rating)}
                                    </td>
                                  );
                                default:
                                  return null;
                              }
                            })}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={visibleColumns.length}
                          className="px-4 py-8 text-center text-gray-400 text-sm"
                        >
                          No products found matching filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </DndContext>
            </div>

            {/* Pagination Controls */}
             <div className="flex items-center justify-between px-4 py-4 border-t border-dark-600">
              <div className="text-xs text-gray-400 font-medium">
                Page {currentPage} of {totalPages}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-dark-600 text-xs text-gray-400 hover:text-white hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label="Previous page"
                >
                  Previous
                </button>

                {/* Visible numeric pages */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        page === currentPage
                          ? 'bg-accent-500 text-white'
                          : 'border border-dark-600 text-txt-secondary hover:bg-dark-700'
                      }`}
                      aria-current={page === currentPage ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  ))}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-dark-600 text-xs text-gray-400 hover:text-white hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
