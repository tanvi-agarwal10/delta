/**
 * DASHBOARD PAGE
 * 
 * WHAT IT SHOWS:
 * =============
 * The main dashboard page with key metrics and overview.
 * For now, it's a placeholder. Later we'll add:
 * - Key metric cards
 * - Charts
 * - Quick stats
 */

export const Dashboard = () => {
  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400 mb-8">Welcome to your admin dashboard</p>

        {/* Placeholder content */}
        <div className="glass-card p-8 text-center">
          <p className="text-gray-300">Dashboard content coming soon...</p>
        </div>
      </div>
    </div>
  );
};
