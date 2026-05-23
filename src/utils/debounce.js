/**
 * Debounce Utility Hook
 * 
 * WHAT IS DEBOUNCING?
 * ===================
 * Debouncing delays function execution until user stops doing something.
 * 
 * WHY IT MATTERS FOR SEARCH:
 * ==========================
 * Without debouncing:
 * - User types "phone" (5 characters)
 * - Makes 5 API calls immediately
 * - Wastes server resources
 * - Slower response times
 * - Confusing results as responses arrive out of order
 * 
 * With debouncing:
 * - Waits for user to stop typing (usually 300ms)
 * - Makes 1 API call
 * - Saves bandwidth
 * - Better UX (no flickering)
 * 
 * REAL WORLD EXAMPLE:
 * When you use Google search, it doesn't search after every keystroke.
 * It waits for you to stop typing, then searches. That's debouncing!
 * 
 * INTERVIEW QUESTION:
 * "How would you implement search that doesn't query on every keystroke?"
 * ANSWER: "I'd use debouncing. It delays the API call until the user
 *         stops typing for X milliseconds, reducing server load."
 */

/**
 * Creates a debounced version of a function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 * 
 * HOW IT WORKS:
 * 1. User calls function immediately
 * 2. Timer starts for 'delay' milliseconds
 * 3. If function called again before timer ends, timer resets
 * 4. When timer completes, execute the function once
 * 
 * EXAMPLE:
 * const debouncedSearch = debounce((query) => {
 *   fetchResults(query);
 * }, 300);
 * 
 * // As user types "phone":
 * debouncedSearch('p');     // Timer starts
 * debouncedSearch('ph');    // Timer resets
 * debouncedSearch('pho');   // Timer resets
 * debouncedSearch('phon');  // Timer resets
 * debouncedSearch('phone'); // Timer resets
 * // ...user stops typing for 300ms
 * // Now API call happens with 'phone'
 */
export const debounce = (func, delay) => {
  let timeoutId;

  return (...args) => {
    // Clear existing timer
    clearTimeout(timeoutId);

    // Set new timer
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

/**
 * React Hook version of debounce - safer for component cleanup
 * 
 * WHY A HOOK VERSION?
 * ==================
 * Direct debounce creates new function on every render (performance issue).
 * This hook ensures:
 * 1. Debounced function is stable across renders
 * 2. Cleanup happens automatically
 * 3. Works correctly with React's lifecycle
 */
import { useCallback, useRef } from 'react';

export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  // useCallback ensures this function doesn't change between renders
  // unless callback or delay changes
  const debouncedCallback = useCallback(
    (...args) => {
      // Clear existing timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timer
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  return debouncedCallback;
};

/**
 * INTERVIEW PREPARATION:
 * 
 * Q: "What's the difference between debounce and throttle?"
 * A: "Debounce waits until user stops doing something.
 *    Throttle executes at regular intervals.
 *    Example: Search uses debounce (wait for typing to stop).
 *    Window resize uses throttle (execute every 300ms during resize)."
 * 
 * Q: "Why not just fetch data on every keystroke?"
 * A: "That would waste server resources and bandwidth. Plus, if responses
 *    come back out of order, you'd show stale results. Debouncing ensures
 *    we only make requests when the user is done typing."
 * 
 * Q: "How do you handle debouncing in React?"
 * A: "Use useCallback hook to ensure the debounced function is stable.
 *    Use useRef to store the timeout ID so we can cancel it if needed."
 */
