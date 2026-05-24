# NovaAdmin | Premium SaaS Catalog & Analytics Dashboard 

NovaAdmin is a high-performance, dark-themed SaaS administration console built with React, Vite, TailwindCSS, and React Query. It is designed to model modern enterprise management interfaces (like Stripe, Vercel, and Linear) and provides complete catalog indexing, real-time analytics visualizations, dynamic routing, and advanced UI interactions (such as drag-and-drop column customization and local layout memory).

---

## 🚀 Key Features

### 1. Responsive Shell Layout
- **Dynamic Sidebar**: Desktop-docked navigation panel that slides smoothly out of the viewport on toggle (`md:-ml-64` margin transition), allowing the main workspace to expand to 100% width. Fully responsive overlay layout on mobile/tablet viewports.
- **Top Header Bar**: Houses active layout toggles, globally synchronized search parameters, real-time background sync indicators, and interactive profile actions.
- **Stacking-Context Aware Dropdowns**: User profile settings and column selectors feature mousedown outside-click event listeners and fixed layer alignments (`z-index` coordination).

### 2. Product Catalog Listing Module
- **Rich Data Grid**: Displays item thumbnails, truncated title labels, category badges, localized USD price formatting, stock status indicators, and customer rating scores.
- **Advanced Sorting**: Client-side sorting on retrieved pagination sets by **Price (Ascending/Descending)**, **Rating**, and **Name (Alphabetical)**.
- **Pagination**: Client-driven pagination index locking to navigate through the 190+ items catalog served by the `dummyjson` product APIs.
- **URL Synchronization**: Updates search parameters (`?search=`, `?category=`, `?sort=`, `?page=`) automatically via `useSearchParams`. Supports copy-pasting links, bookmarking, and native browser forward/backward navigation.

### 3. Column Customization (Bonus)
- **Show/Hide Columns**: Dropdown checkboxes allow users to toggle column visibilities in real-time.
- **Drag-and-Drop Reordering**: Built with `@dnd-kit/core` and `@dnd-kit/sortable`, allowing users to drag columns left and right to reorder the table structure dynamically.
- **Persistent Memory**: Column ordering and visibilities are saved automatically to `localStorage` and restored on page refresh.

### 4. Asynchronous Data Engine & Polling (Bonus)
- **React Query Fetching**: Manages server state, automatic caching (5-minute stale threshold), retry-backoffs, and loading states.
- **Background Synchronization**: Automatically polls the API every 30 seconds in the background. Shows an animated pulsing **Syncing** status badge in the header, which falls back to a green **Live** indicator once the fetch completes.
- **Manual Cache Invalidation**: The table toolbar and header include manual refresh buttons to invalidate the cache and force immediate data fetches.

### 5. Product Details View
- **Dynamic Routing**: Dynamic routes matched at `/product/:id` utilizing lazy-loaded code-splitting boundaries.
- **Media Slider**: Swiper carousel supporting navigation chevrons, pagination bullets, and thumbnail previews.
- **Comprehensive Specifications**: Displays full reviews list, manufacturer/SKU branding, stock indicators, and placeholder shopping cart actions.

### 6. Analytics Section
- **Valuation Cards**: Displays Total SKUs count, average product rating, total stock valuation (`price * stock`), and restock alert lists.
- **Interactive Visualizations (Recharts)**:
  - **Category Distribution (Pie Chart)**: Inner-radius pie chart mapping count ratios. Includes legend hover triggers updating a central display index.
  - **Quality Index (Bar Chart)**: Horizontal layout sorting average rating parameters.
  - **Financial Valuation (Bar Chart)**: Vertical bar layouts sizing overall category values.
  - **Price-Rating Correlation (Composed Chart)**: Visualizes distribution density matching product costs against quality ratings.

---

## ⚡ Performance Optimizations

1. **Stable Search Debouncing**: Custom `useDebounce` hook implemented with a callback ref (`useRef`) to avoid recreating the debounced trigger on render cycles. This reduces query requests from one call per keystroke to exactly one call 300ms after the user stops typing (80%+ reduction in API load).
2. **Synchronous Screen Initialization**: The responsive sidebar initialization reads `window.innerWidth` synchronously inside the state initializer to prevent cascading render cycles or strict mode layout flashes.
3. **Component Memoization**: Reusable child components (such as table headers) are wrapped in `React.memo` to skip rendering cycles during active reordering, pagination, or filtering.
4. **Calculations Caching**: Expensive aggregations (such as analytics metric maps and sort rankings) are cached with `useMemo` to only execute when raw data vectors change.
5. **Code Splitting**: Dynamic chunks are generated via `React.lazy` and wrapped inside custom `Suspense` loaders to keep initial loading bundle footprints small.

---

## 📂 Repository Directory Structure

```
src/
├── pages/
│   ├── Dashboard.jsx          # Metric cards and overview charts
│   ├── Products.jsx           # Products page wrapper
│   ├── ProductDetails.jsx     # Swiper carousel and product specs
│   └── Analytics.jsx          # Category distributions and valuations
├── components/
│   ├── layout/
│   │   ├── Layout.jsx         # Flex workspace parent container
│   │   ├── Sidebar.jsx        # Navigation panel and collapse actions
│   │   └── Navbar.jsx         # Sticky header and sync indicators
│   └── products/
│       └── ProductsTable.jsx  # Table data, column toggling, and DnD
├── services/
│   └── api.js                 # Axios API layer and product endpoints
├── utils/
│   ├── formatters.js          # Currency, truncation, and status utils
│   └── debounce.js            # Stable useDebounce hook definition
└── App.jsx                    # Routing mapping and lazy page chunks
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   cd NovaAdmin
   ```
2. Install the workspace dependencies:
   ```bash
   npm install
   ```

### Development Commands
- **Start Local Server**:
  ```bash
  npm run dev
  ```
  The app will run locally at [http://localhost:5173/](http://localhost:5173/).

- **Verify Lint Rules**:
  ```bash
  npm run lint
  ```

- **Compile Production Build**:
  ```bash
  npm run build
  ```

- **Preview Compiled App Locally**:
  ```bash
  npm run preview
  ```
