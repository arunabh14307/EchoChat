import { useEffect, useRef } from 'react';

/**
 * useDebounce — delays invoking a value update until after the specified wait.
 * Useful for search inputs to reduce API calls.
 *
 * @template T
 * @param {T} value — The value to debounce
 * @param {number} delay — Milliseconds to wait
 * @returns {T} Debounced value
 *
 * @example
 * const debouncedSearch = useDebounce(searchQuery, 400);
 * useEffect(() => { fetchResults(debouncedSearch); }, [debouncedSearch]);
 */
import { useState } from 'react';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * useDebouncedCallback — debounces a callback function instead of a value.
 *
 * @param {Function} callback
 * @param {number} delay
 * @returns {Function} Debounced callback
 */
export const useDebouncedCallback = (callback, delay) => {
  const timerRef = useRef(null);

  const debouncedFn = (...args) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return debouncedFn;
};
