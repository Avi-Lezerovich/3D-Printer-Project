/**
 * HelpContainer - Professional Main Container
 * 
 * Enterprise-grade help container component implementing
 * clean container-presentational pattern with comprehensive
 * search functionality and professional UX.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';

import { 
  HelpHeader,
  SearchBar,
  CategoryNav,
  QuickLinks,
  FAQList,
  ErrorBoundary,
  LoadingState
} from './components';

import { useHelp } from './hooks/useHelp';
import type { HelpContainerProps, HelpCategory } from './types';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

/**
 * Professional Help Container Component
 * 
 * Main orchestration component that manages the help system
 * with clean separation of concerns and professional search/filter functionality.
 */
export const HelpContainer: React.FC<HelpContainerProps> = ({
  initialCategory = 'all',
  initialQuery = ''
}) => {
  // Local state for UI interactions
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<'all' | HelpCategory>(initialCategory);

  // Business logic hook
  const {
    state,
    actions: { searchFAQs, trackView, voteHelpful }
  } = useHelp({
    initialQuery: searchQuery,
    initialCategory: selectedCategory
  });

  // Memoized filtered results
  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let filtered = state.faqs;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    // Filter by search query
    if (query) {
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [state.faqs, selectedCategory, searchQuery]);

  // Memoized event handlers
  const handleFaqToggle = useCallback(async (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
    
    if (openFaq !== id) {
      // Track view when FAQ is opened
      try {
        await trackView(id);
      } catch (error) {
        console.error('Failed to track FAQ view:', error);
      }
    }
  }, [openFaq, trackView]);

  const handleSearchChange = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      try {
        await searchFAQs(query, { category: selectedCategory !== 'all' ? selectedCategory : undefined });
      } catch (error) {
        console.error('Search failed:', error);
      }
    }
  }, [searchFAQs, selectedCategory]);

  const handleCategoryChange = useCallback((category: 'all' | HelpCategory) => {
    setSelectedCategory(category);
    setOpenFaq(null); // Close any open FAQ when changing categories
  }, []);

  const handleHelpfulVote = useCallback(async (faqId: number, helpful: boolean) => {
    try {
      await voteHelpful(faqId, helpful);
    } catch (error) {
      console.error('Failed to submit helpful vote:', error);
    }
  }, [voteHelpful]);

  // Error state
  if (state.error && !state.isLoading) {
    return (
      <HelpErrorState 
        error={state.error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Loading state for initial load
  if (state.isLoading && !state.faqs.length) {
    return <LoadingState />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header with Search */}
        <HelpHeader
          title="Help & Support Center"
          subtitle="Find answers, guides, and get the support you need"
          showSearch
          searchProps={{
            query: searchQuery,
            onQueryChange: handleSearchChange,
            isLoading: state.searchState.isLoading,
            placeholder: "Search help topics..."
          }}
        />

        {/* Content */}
        <motion.div 
          className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <QuickLinks
              links={state.quickLinks}
              title="Popular Resources"
            />
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
            {/* Category Navigation */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <CategoryNav
                categories={state.categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                showCounts
              />
            </motion.div>

            {/* FAQ Content */}
            <motion.div variants={itemVariants} className="lg:col-span-3">
              <FAQList
                faqs={filteredFaqs}
                openFaq={openFaq}
                onFaqToggle={handleFaqToggle}
                isLoading={state.searchState.isLoading}
                emptyMessage={
                  searchQuery 
                    ? `No results found for "${searchQuery}"`
                    : selectedCategory !== 'all'
                      ? `No FAQs found in this category`
                      : "No FAQs available"
                }
              />
            </motion.div>
          </div>

          {/* Analytics Info (for debugging in dev mode) */}
          {process.env.NODE_ENV === 'development' && (
            <motion.div 
              variants={itemVariants}
              className="mt-12 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50"
            >
              <h3 className="text-lg font-medium text-slate-300 mb-2">Help Analytics</h3>
              <div className="grid grid-cols-3 gap-4 text-sm text-slate-400">
                <div>Total FAQs: {state.faqs.length}</div>
                <div>Filtered Results: {filteredFaqs.length}</div>
                <div>Selected Category: {selectedCategory}</div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </ErrorBoundary>
  );
};

/**
 * Professional Error State Component
 */
interface HelpErrorStateProps {
  error: string;
  onRetry: () => void;
}

const HelpErrorState: React.FC<HelpErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center"
      >
        <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg p-8">
          <div className="text-red-400 text-lg font-medium mb-4">
            Failed to Load Help Center
          </div>
          <div className="text-slate-300 mb-6 text-sm">
            {error}
          </div>
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 font-medium transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default HelpContainer;