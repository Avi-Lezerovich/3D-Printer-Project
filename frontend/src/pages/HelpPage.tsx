import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  HelpCircle, MessageSquare, 
  Mail, ExternalLink, Book, Lightbulb
} from 'lucide-react';
import {
  FAQ,
  SearchableHelp,
  CategoryNav,
  faqs,
  categories
} from '../features/help';

const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredFAQs = useMemo(() => {
    let filtered = faqs;
    
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [searchQuery, activeCategory]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Reset category when searching
    if (query.trim() && activeCategory !== 'all') {
      setActiveCategory('all');
    }
  };

  return (
    <div className="help-page">
      <div className="help-header">
        <div className="header-content">
          <h1 className="help-title">
            <HelpCircle className="w-6 h-6" />
            Help & Documentation
          </h1>
          <p className="help-subtitle">
            Find answers to common questions and learn how to use the 3D printer control system
          </p>
        </div>
      </div>

      <div className="help-content">
        <div className="help-search">
          <SearchableHelp
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            placeholder="Search help topics, features, troubleshooting..."
          />
        </div>

        <div className="help-layout">
          <aside className="help-sidebar">
            <CategoryNav
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />

            <div className="help-quick-links">
              <h3 className="quick-links-title">Quick Links</h3>
              <div className="quick-links-list">
                <a href="/docs/getting-started" className="quick-link">
                  <Book className="w-4 h-4" />
                  Getting Started Guide
                </a>
                <a href="/docs/troubleshooting" className="quick-link">
                  <Lightbulb className="w-4 h-4" />
                  Troubleshooting
                </a>
                <a href="mailto:support@printer-system.com" className="quick-link">
                  <Mail className="w-4 h-4" />
                  Contact Support
                </a>
                <a 
                  href="https://github.com/printer-system/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="quick-link"
                >
                  <ExternalLink className="w-4 h-4" />
                  Documentation
                </a>
              </div>
            </div>
          </aside>

          <main className="help-main">
            <div className="help-results">
              {searchQuery && (
                <div className="search-results-header">
                  <p>
                    {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} 
                    {searchQuery && ` for "${searchQuery}"`}
                  </p>
                </div>
              )}

              <AnimatePresence mode="wait">
                {filteredFAQs.length > 0 ? (
                  <motion.div
                    key={`${activeCategory}-${searchQuery}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FAQ items={filteredFAQs} />
                  </motion.div>
                ) : (
                  <motion.div
                    className="no-results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <MessageSquare className="w-12 h-12 text-gray-400" />
                    <h3>No results found</h3>
                    <p>
                      Try adjusting your search terms or browse different categories.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory('all');
                      }}
                      className="btn-secondary"
                    >
                      Clear filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;