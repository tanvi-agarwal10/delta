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

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { ProductDetails } from './pages/ProductDetails';
import { Analytics } from './pages/Analytics';
import './App.css';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;

