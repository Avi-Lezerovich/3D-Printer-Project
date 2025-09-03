/**
 * SearchBar - Professional Search Component
 * 
 * Enterprise-grade search input with debouncing, loading states,
 * and accessibility features.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';

import type { SearchBarProps } from '../types';

/**
 * Professional Search Bar Component
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  placeholder = "Search help topics...",
  isLoading = false
}) => {
  const [localQuery, setLocalQuery] = useState(query);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localQuery !== query) {
        onQueryChange(localQuery);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [localQuery, query, onQueryChange]);

  // Sync with external query changes
  useEffect(() => {
    if (query !== localQuery) {
      setLocalQuery(query);
    }
  }, [query, localQuery]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setLocalQuery('');
    onQueryChange('');
  }, [onQueryChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-2xl mx-auto"
    >
      <div className="relative group">
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200" />
          )}
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={localQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="
            w-full pl-12 pr-12 py-4 
            bg-slate-800/50 backdrop-blur-sm 
            border border-slate-600/50 
            hover:border-slate-500/50 
            focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
            rounded-xl text-slate-200 placeholder-slate-400
            transition-all duration-200
            text-lg font-medium
          "
          aria-label="Search help topics"
          role="searchbox"
          aria-expanded={!!localQuery}
          autoComplete="off"
          spellCheck="false"
        />

        {/* Clear Button */}
        {localQuery && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleClear}
            className="
              absolute right-4 top-1/2 -translate-y-1/2
              w-6 h-6 flex items-center justify-center
              text-slate-400 hover:text-slate-300
              rounded-full hover:bg-slate-700/50
              transition-all duration-200
            "
            aria-label="Clear search"
            type="button"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}

        {/* Focus Ring Effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
      </div>

      {/* Search Results Count */}
      {localQuery && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-center text-sm text-slate-400"
        >
          Searching for "{localQuery}"...
        </motion.div>
      )}
    </motion.div>
  );
};

export default SearchBar;