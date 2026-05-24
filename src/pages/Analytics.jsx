import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';
import {
  Loader,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Award,
  Layers,
} from 'lucide-react';
import { productService } from '../services/api';
import { formatPrice, formatRating } from '../utils/formatters';

const COLORS = [
  '#6366F1', // Accent Primary
  '#7C83FF', // Accent Hover
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#4B5563', // Neutral Gray
  '#A5B4FC', // Light Indigo
  '#93C5FD', // Light Blue
  '#C084FC', // Light Violet
];

export const Analytics = () => {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Fetch all 100 products to analyze data
  const { data: products, isLoading, isPending, error } = useQuery({
    queryKey: ['all-products-analytics'],
    queryFn: async () => {
      const response = await productService.getAllProducts({ limit: 100 });
      return response.data?.products || [];
    },
    staleTime: 1000 * 60 * 10, // Cache analysis data for 10 minutes
  });

  // Calculate distributions and values
  const analyticsData = useMemo(() => {
    if (!products || products.length === 0) return null;

    // 1. Category Distribution & Valuation
    const categoryStatsMap = {};
    products.forEach((p) => {
      if (!categoryStatsMap[p.category]) {
        categoryStatsMap[p.category] = {
          category: p.category,
          count: 0,
          totalValue: 0,
          totalRating: 0,
        };
      }
      categoryStatsMap[p.category].count += 1;
      categoryStatsMap[p.category].totalValue += (Number(p.price) || 0) * (Number(p.stock) || 0);
      categoryStatsMap[p.category].totalRating += Number(p.rating) || 0;
    });

    const categoryStats = Object.values(categoryStatsMap).map((stat) => ({
      name: stat.category.charAt(0).toUpperCase() + stat.category.slice(1),
      value: stat.count,
      totalVal: stat.totalValue,
      avgRating: Number((stat.totalRating / stat.count).toFixed(2)),
    }));

    // Sort category stats by count descending
    categoryStats.sort((a, b) => b.value - a.value);

    // 2. Rating vs Price correlation
    const scatterLikeData = products.map((p) => ({
      name: p.title,
      price: Number(p.price) || 0,
      rating: Number(p.rating) || 0,
      stock: Number(p.stock) || 0,
    }));

    // Sort scatter items by price to show clean trend lines
    scatterLikeData.sort((a, b) => a.price - b.price);

    // 3. Overall Top Analytics Metrics
    const totalInventoryValue = products.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0), 0);
    const avgPrice = products.reduce((sum, p) => sum + (Number(p.price) || 0), 0) / products.length;
    const avgRating = products.reduce((sum, p) => sum + (Number(p.rating) || 0), 0) / products.length;
    
    // Low stock items threshold < 10
    const lowStockCount = products.filter((p) => (Number(p.stock) || 0) < 10).length;

    return {
      categoryStats,
      scatterLikeData,
      totalInventoryValue,
      avgPrice,
      avgRating,
      lowStockCount,
    };
  }, [products]);

  // Loading state (show loader during initial load or while data is fetching/undefined)
  if (isLoading || isPending || (!products && !error)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full gap-4">
        <Loader className="w-10 h-10 animate-spin text-accent-500" />
        <span className="text-sm text-txt-secondary font-medium">Running deep catalog analysis...</span>
      </div>
    );
  }

  // Error state (only show error if fetch is done and products failed to load)
  if (error || !analyticsData) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-20 bg-red-500/10 border border-red-500/20 rounded-2xl">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">Failed to run analytics</h3>
        <p className="text-gray-400 text-sm">An error occurred while building data insights.</p>
      </div>
    );
  }

  // Custom Pie chart active shape selector
  const onPieEnter = (_, index) => {
    setActiveCategoryIndex(index);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 w-full">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-accent-500 bg-clip-text text-transparent mb-1">
          Business Analytics
        </h1>
        <p className="text-sm text-txt-secondary">
          Advanced inventory valuations, segmentations, and pricing distributions
        </p>
      </div>

      {/* Analytics Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Valuation */}
        <div className="glass-card p-6 flex items-center justify-between border-b-2 border-b-accent-500 hover:shadow-accent-500/5 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">Inventory Value</span>
            <h3 className="text-2xl font-bold text-white">{formatPrice(analyticsData.totalInventoryValue)}</h3>
            <p className="text-[10px] text-txt-secondary font-medium">Total value of all items in stock</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center">
            <DollarSign size={20} className="text-accent-500" />
          </div>
        </div>

        {/* Card 2: Avg Price */}
        <div className="glass-card p-6 flex items-center justify-between border-b-2 border-b-success hover:shadow-success/5 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">Average Unit Cost</span>
            <h3 className="text-2xl font-bold text-white">{formatPrice(analyticsData.avgPrice)}</h3>
            <p className="text-[10px] text-txt-secondary font-medium">Mean price per catalog SKU</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <TrendingUp size={20} className="text-success" />
          </div>
        </div>

        {/* Card 3: Avg Rating */}
        <div className="glass-card p-6 flex items-center justify-between border-b-2 border-b-warning hover:shadow-warning/5 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">Customer Score</span>
            <h3 className="text-2xl font-bold text-white">{formatRating(analyticsData.avgRating)} / 5.0</h3>
            <p className="text-[10px] text-txt-secondary font-medium">Average user rating score</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Award size={20} className="text-warning" />
          </div>
        </div>

        {/* Card 4: Low Stock Alert */}
        <div className="glass-card p-6 flex items-center justify-between border-b-2 border-b-error hover:shadow-error/5 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">Restock Alerts</span>
            <h3 className="text-2xl font-bold text-white">{analyticsData.lowStockCount} SKUs</h3>
            <p className="text-[10px] text-error font-semibold">Stock quantity below 10 units</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
            <Layers size={20} className="text-error" />
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Category Distribution (Pie Chart) */}
        <div className="glass-card p-6 space-y-4 flex flex-col">
          <div>
            <h3 className="text-lg font-bold text-white">Category Distribution</h3>
            <p className="text-xs text-gray-400">Inventory counts by primary categories</p>
          </div>
          
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center min-h-[300px] gap-6">
            <div className="h-64 w-64 relative flex-shrink-0">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={analyticsData.categoryStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                    >
                      {analyticsData.categoryStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="#161B22"
                          strokeWidth={activeCategoryIndex === index ? 3 : 1}
                          style={{ outline: 'none' }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#161B22',
                        border: '1px solid #2A3441',
                        borderRadius: '12px',
                        color: '#F3F4F6',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full bg-white/[0.02] animate-pulse rounded-full" />
              )}
              
              {/* Central text display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-2xl font-extrabold text-white">
                  {analyticsData.categoryStats[activeCategoryIndex]?.value || 0}
                </span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  {analyticsData.categoryStats[activeCategoryIndex]?.name || 'Total'}
                </span>
              </div>
            </div>

            {/* List side legend */}
            <div className="flex-1 max-h-72 overflow-y-auto custom-scrollbar w-full space-y-2.5">
              {analyticsData.categoryStats.slice(0, 8).map((cat, idx) => (
                <div
                  key={cat.name}
                  onMouseEnter={() => setActiveCategoryIndex(idx)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    activeCategoryIndex === idx ? 'bg-dark-700' : 'hover:bg-dark-700/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-xs font-medium text-gray-200">{cat.name}</span>
                  </div>
                  <span className="text-xs font-bold text-white">{cat.value} items</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Category Ratings (Bar Chart) */}
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Quality Index</h3>
            <p className="text-xs text-gray-400">Average customer ratings per category</p>
          </div>
          <div className="h-[300px] w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={analyticsData.categoryStats.slice(0, 8)}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" domain={[3.5, 5]} stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#161B22',
                      border: '1px solid #2A3441',
                      borderRadius: '12px',
                      color: '#F3F4F6',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="avgRating" name="Rating Index" radius={[0, 4, 4, 0]}>
                    {analyticsData.categoryStats.slice(0, 8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-white/[0.02] animate-pulse rounded-2xl" />
            )}
          </div>
        </div>

        {/* Chart 3: Valuation Breakdown */}
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Financial Valuation</h3>
            <p className="text-xs text-gray-400">Total inventory price valuation per category</p>
          </div>
          <div className="h-[300px] w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={analyticsData.categoryStats.slice(0, 7)}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    formatter={(value) => [formatPrice(value), 'Valuation']}
                    contentStyle={{
                      backgroundColor: '#161B22',
                      border: '1px solid #2A3441',
                      borderRadius: '12px',
                      color: '#F3F4F6',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="totalVal" name="Inventory Value" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-white/[0.02] animate-pulse rounded-2xl" />
            )}
          </div>
        </div>

        {/* Chart 4: Price & Rating Composed Correlation */}
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Price-Rating Correlation</h3>
            <p className="text-xs text-gray-400">Catalog items ordered by price compared to rating trends</p>
          </div>
          <div className="h-[300px] w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <ComposedChart
                  data={analyticsData.scatterLikeData.slice(0, 30)}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,52,65,0.4)" />
                  <XAxis dataKey="price" stroke="#9ca3af" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
                  <YAxis yAxisId="left" stroke="#818cf8" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={11} tickLine={false} domain={[2, 5]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#161B22',
                      border: '1px solid #2A3441',
                      borderRadius: '12px',
                      color: '#F3F4F6',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar yAxisId="left" dataKey="price" name="Retail Price ($)" fill="rgba(99, 102, 241, 0.15)" radius={[2, 2, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="rating" name="Rating Index" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-white/[0.02] animate-pulse rounded-2xl" />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
