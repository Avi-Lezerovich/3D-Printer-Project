import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

interface SearchableHelpProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
  placeholder?: string;
}

const SearchableHelp: React.FC<SearchableHelpProps> = ({ 
  onSearchChange, 
  searchQuery, 
  placeholder = "Search help topics..."
}) => {
  const clearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <Search className="w-5 h-5 search-icon" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="clear-search"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchableHelp;