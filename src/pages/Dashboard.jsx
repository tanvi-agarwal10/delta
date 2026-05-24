import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  DollarSign,
  Star,
  Layers,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Loader,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { productService } from '../services/api';
import { formatPrice, formatRating, getStockStatus } from '../utils/formatters';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Fetch all products (limit=100) to aggregate calculations on client
  const { data: products, isLoading, isPending, error } = useQuery({
    queryKey: ['all-products-dashboard'],
    queryFn: async () => {
      const response = await productService.getAllProducts({ limit: 100 });
      return response.data?.products || [];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Calculate dashboard stats memoized
  const stats = useMemo(() => {
    if (!products || products.length === 0) return null;

    const totalProducts = products.length;
    const avgPrice = products.reduce((sum, p) => sum + (Number(p.price) || 0), 0) / totalProducts;
    const avgRating = products.reduce((sum, p) => sum + (Number(p.rating) || 0), 0) / totalProducts;
    const totalInventoryValue = products.reduce((sum, p) => sum + ((Number(p.price) || 0) * (Number(p.stock) || 0)), 0);

    // Group categories count
    const categoryCountMap = {};
    products.forEach((p) => {
      categoryCountMap[p.category] = (categoryCountMap[p.category] || 0) + 1;
    });
    const totalCategories = Object.keys(categoryCountMap).length;

    // Top 5 highest rated products
    const topRated = [...products]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    // Price brackets for bar chart
    const priceBrackets = [
      { name: '<$20', count: 0 },
      { name: '$20-$50', count: 0 },
      { name: '$50-$100', count: 0 },
      { name: '$100-$500', count: 0 },
      { name: '$500+', count: 0 },
    ];
    products.forEach((p) => {
      const price = Number(p.price) || 0;
      if (price < 20) priceBrackets[0].count++;
      else if (price < 50) priceBrackets[1].count++;
      else if (price < 100) priceBrackets[2].count++;
      else if (price < 500) priceBrackets[3].count++;
      else priceBrackets[4].count++;
    });

    // Rating distribution for area chart
    const ratingBins = [
      { range: '4.0 - 4.2', count: 0 },
      { range: '4.2 - 4.4', count: 0 },
      { range: '4.4 - 4.6', count: 0 },
      { range: '4.6 - 4.8', count: 0 },
      { range: '4.8 - 5.0', count: 0 },
    ];
    products.forEach((p) => {
      const r = Number(p.rating) || 0;
      if (r >= 4.0 && r < 4.2) ratingBins[0].count++;
      else if (r >= 4.2 && r < 4.4) ratingBins[1].count++;
      else if (r >= 4.4 && r < 4.6) ratingBins[2].count++;
      else if (r >= 4.6 && r < 4.8) ratingBins[3].count++;
      else if (r >= 4.8 && r <= 5.0) ratingBins[4].count++;
    });

    return {
      totalProducts,
      avgPrice,
      avgRating,
      totalInventoryValue,
      totalCategories,
      topRated,
      priceBrackets,
      ratingBins,
    };
  }, [products]);

  // Loading state (show loader during initial load or while data is fetching/undefined)
  if (isLoading || isPending || (!products && !error)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full gap-4">
        <Loader className="w-10 h-10 animate-spin text-accent-500" />
        <span className="text-sm text-txt-secondary">Loading catalog dashboard...</span>
      </div>
    );
  }

  // Error state (only show error if fetch is done and products failed to load)
  if (error || !stats) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-20 bg-red-500/10 border border-red-500/20 rounded-2xl">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">Failed to load statistics</h3>
        <p className="text-gray-400 text-sm">Could not fetch catalog products details.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-accent-500 bg-clip-text text-transparent mb-1">
          Catalog Overview
        </h1>
        <p className="text-sm text-txt-secondary">
          Real-time summary analytics compiled from your live product inventory
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Products */}
        <div className="glass-card p-6 flex items-center justify-between border-l-4 border-l-accent-500 hover:scale-[1.02] hover:border-accent-500/40 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">Total Products</span>
            <h3 className="text-3xl font-bold text-white">{stats.totalProducts}</h3>
            <span className="text-[10px] text-accent-500 flex items-center gap-1 font-bold">
              <TrendingUp size={12} /> Active Catalog Items
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center border border-accent-500/20">
            <Package size={22} className="text-accent-500" />
          </div>
        </div>

        {/* Card 2: Avg Price */}
        <div className="glass-card p-6 flex items-center justify-between border-l-4 border-l-success hover:scale-[1.02] hover:border-success/40 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">Average Price</span>
            <h3 className="text-3xl font-bold text-white">{formatPrice(stats.avgPrice)}</h3>
            <span className="text-[10px] text-success flex items-center gap-1 font-bold">
              <TrendingUp size={12} /> Value per SKU
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center border border-success/20">
            <DollarSign size={22} className="text-success" />
          </div>
        </div>

        {/* Card 3: Avg Rating */}
        <div className="glass-card p-6 flex items-center justify-between border-l-4 border-l-warning hover:scale-[1.02] hover:border-warning/40 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">Avg Rating</span>
            <h3 className="text-3xl font-bold text-white">{formatRating(stats.avgRating)}</h3>
            <span className="text-[10px] text-warning flex items-center gap-1 font-bold">
              ⭐ Premium Quality
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center border border-warning/20">
            <Star size={22} className="text-warning" />
          </div>
        </div>

        {/* Card 4: Inventory value */}
        <div className="glass-card p-6 flex items-center justify-between border-l-4 border-l-accent-600 hover:scale-[1.02] hover:border-accent-600/40 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">Total Value</span>
            <h3 className="text-3xl font-bold text-white">{formatPrice(stats.totalInventoryValue)}</h3>
            <span className="text-[10px] text-accent-600 flex items-center gap-1 font-bold">
              <Layers size={12} /> Stock Valuation
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-600/10 flex items-center justify-center border border-accent-600/20">
            <Layers size={22} className="text-accent-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Rating distributions (Area) */}
        <div className="glass-card p-6 lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Quality Distribution</h3>
              <p className="text-xs text-gray-400">Total catalog products mapped by rating ranges</p>
            </div>
            <span className="text-[10px] bg-accent-500/10 border border-accent-500/20 text-accent-500 font-bold px-2 py-0.5 rounded-full">
              Area Distribution
            </span>
          </div>
          <div className="h-72 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={stats.ratingBins} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,52,65,0.4)" />
                  <XAxis dataKey="range" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#161B22',
                      border: '1px solid #2A3441',
                      borderRadius: '12px',
                      color: '#F3F4F6',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="count" name="Products" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#areaColor)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-white/[0.02] animate-pulse rounded-2xl" />
            )}
          </div>
        </div>

        {/* Pricing Brackets (Bar) */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Pricing Segments</h3>
              <p className="text-xs text-gray-400">SKUs grouped by retail pricing categories</p>
            </div>
            <span className="text-[10px] bg-success/10 border border-success/20 text-success font-bold px-2 py-0.5 rounded-full">
              Product Counts
            </span>
          </div>
          <div className="h-72 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={stats.priceBrackets} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,52,65,0.4)" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{
                      backgroundColor: '#161B22',
                      border: '1px solid #2A3441',
                      borderRadius: '12px',
                      color: '#F3F4F6',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" name="SKUs" radius={[4, 4, 0, 0]}>
                    {stats.priceBrackets.map((entry, index) => {
                      const colors = ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-white/[0.02] animate-pulse rounded-2xl" />
            )}
          </div>
        </div>
      </div>

      {/* Top Performing Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-dark-600 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Top Performance Products</h3>
            <p className="text-xs text-txt-secondary">High rating items across all categories</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-1.5 text-xs text-accent-500 hover:text-accent-600 font-bold group transition-all"
          >
            View All Products
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600 bg-dark-900/50">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-txt-secondary uppercase tracking-wider">Product</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-txt-secondary uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-txt-secondary uppercase tracking-wider">Price</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-txt-secondary uppercase tracking-wider">Rating</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-txt-secondary uppercase tracking-wider">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600/50">
              {stats.topRated.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <tr
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="hover:bg-dark-700/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                           src={product.thumbnail}
                           alt={product.title}
                           className="w-10 h-10 rounded-lg object-cover bg-dark-900 border border-dark-600"
                        />
                        <div>
                          <p className="text-sm font-semibold text-white truncate max-w-[200px]">{product.title}</p>
                          <p className="text-[10px] text-txt-secondary font-medium">Brand: {product.brand || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-txt-secondary capitalize">{product.category}</td>
                    <td className="px-6 py-4 text-sm font-bold text-white">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400">⭐</span>
                        <span className="text-xs font-bold text-white">{formatRating(product.rating)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${stockStatus.color} ${stockStatus.bgColor}`}>
                        {stockStatus.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

