/**
 * String & Format Utilities
 * 
 * WHY WE NEED UTILITIES?
 * =====================
 * These reusable functions prevent:
 * 1. Code duplication across components
 * 2. Formatting inconsistencies (different date formats in different places)
 * 3. Bugs (formatting logic in multiple places = multiple places to fix bugs)
 * 
 * PRINCIPLE: "DRY" - Don't Repeat Yourself
 * Every piece of logic should live in exactly one place
 */

/**
 * Format price as currency (USD)
 * @param {number} price - Price amount
 * @returns {string} Formatted price like "$19.99"
 * 
 * EXAMPLE:
 * formatPrice(19.99) => "$19.99"
 * formatPrice(1000) => "$1,000.00"
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

/**
 * Capitalize first letter of string
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 * 
 * EXAMPLE:
 * capitalize('hello') => "Hello"
 * capitalize('HELLO') => "Hello"
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncate long text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 * 
 * EXAMPLE:
 * truncate('This is a very long text', 10) => "This is..."
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

/**
 * Create slug from string (for URLs)
 * @param {string} str - String to slugify
 * @returns {string} URL-friendly slug
 * 
 * EXAMPLE:
 * slugify('Hello World') => "hello-world"
 * slugify('Product Name!') => "product-name"
 */
export const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-'); // Replace multiple dashes with single
};

/**
 * Format rating to one decimal place
 * @param {number} rating - Rating value
 * @returns {string} Formatted rating like "4.5"
 */
export const formatRating = (rating) => {
  return Number(rating).toFixed(1);
};

/**
 * Determine stock status based on quantity
 * @param {number} stock - Stock quantity
 * @returns {object} Object with status and color
 * 
 * INTERVIEW NOTE:
 * This encapsulates business logic. If rules change
 * (e.g., "low stock" threshold from 10 to 5),
 * we change it in ONE place, not in all components.
 */
export const getStockStatus = (stock) => {
  if (stock > 20) {
    return { status: 'In Stock', color: 'text-success', bgColor: 'bg-success/10' };
  }
  if (stock > 10) {
    return { status: 'Low Stock', color: 'text-warning', bgColor: 'bg-warning/10' };
  }
  return { status: 'Out of Stock', color: 'text-error', bgColor: 'bg-error/10' };
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {number} Discount percentage
 * 
 * EXAMPLE:
 * calculateDiscount(100, 80) => 20
 */
export const calculateDiscount = (originalPrice, discountedPrice) => {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};
