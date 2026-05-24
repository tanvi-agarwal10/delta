/**
 * MAIN APP COMPONENT
 * 
 * WHAT IT DOES:
 * =============
 * Sets up routing for the entire application.
 * All pages are wrapped in the Layout component.
 * 
 * ROUTING STRATEGY:
 * - / -> Dashboard
 * - /products -> Products listing
 * - /product/:id -> Product details
 * - /analytics -> Analytics page
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import './App.css';

// Lazy-load pages to improve performance and code split the bundles
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Products = lazy(() => import('./pages/Products').then(m => ({ default: m.Products })));
const ProductDetails = lazy(() => import('./pages/ProductDetails').then(m => ({ default: m.ProductDetails })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));

// Beautiful, premium loading fallback spinner for code-split components
const ViewLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] w-full gap-4">
    <div className="relative flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-indigo-500/10 border-t-indigo-400 animate-spin"></div>
      <div className="absolute w-8 h-8 rounded-full border-2 border-purple-500/10 border-b-purple-400 animate-spin animate-duration-1000 reverse"></div>
    </div>
    <span className="text-xs text-gray-500 font-semibold tracking-wider uppercase animate-pulse">Loading view...</span>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<ViewLoader />}>
        <Routes>
          {/* All routes wrapped in Layout for consistent sidebar/navbar */}
          <Route
            element={<Layout><Dashboard /></Layout>}
            path="/"
          />
          <Route
            element={<Layout><Products /></Layout>}
            path="/products"
          />
          <Route
            element={<Layout><ProductDetails /></Layout>}
            path="/product/:id"
          />
          <Route
            element={<Layout><Analytics /></Layout>}
            path="/analytics"
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

