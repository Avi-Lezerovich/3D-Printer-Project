/**
 * Help Feature Types - Professional TypeScript Definitions
 * 
 * Comprehensive type definitions for the help system following
 * enterprise-grade patterns with strict typing.
 */

import type { LucideIcon } from 'lucide-react';

// ========================================
// Core Help Types
// ========================================

export interface FAQ {
  readonly id: number;
  readonly question: string;
  readonly answer: string;
  readonly category: HelpCategory;
  readonly icon: LucideIcon;
  readonly tags?: readonly string[];
  readonly lastUpdated?: string;
  readonly helpful?: number; // helpful votes
  readonly views?: number;
}

export type HelpCategory = 
  | 'printing' 
  | 'monitoring' 
  | 'management' 
  | 'files' 
  | 'configuration' 
  | 'troubleshooting';

export interface HelpCategoryInfo {
  readonly id: 'all' | HelpCategory;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly description?: string;
  readonly count?: number;
}

export interface QuickLink {
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly href: string;
  readonly external?: boolean;
}

// ========================================
// Search and Filtering
// ========================================

export interface SearchState {
  readonly query: string;
  readonly selectedCategory: 'all' | HelpCategory;
  readonly results: readonly FAQ[];
  readonly isLoading: boolean;
  readonly totalResults: number;
}

export interface SearchFilters {
  readonly category?: HelpCategory;
  readonly tags?: readonly string[];
  readonly sortBy?: 'relevance' | 'date' | 'helpful' | 'views';
  readonly sortOrder?: 'asc' | 'desc';
}

// ========================================
// Component Props Interfaces
// ========================================

export interface HelpContainerProps {
  readonly initialCategory?: HelpCategory;
  readonly initialQuery?: string;
}

export interface SearchBarProps {
  readonly query: string;
  readonly onQueryChange: (query: string) => void;
  readonly placeholder?: string;
  readonly isLoading?: boolean;
}

export interface CategoryNavProps {
  readonly categories: readonly HelpCategoryInfo[];
  readonly selectedCategory: 'all' | HelpCategory;
  readonly onCategoryChange: (category: 'all' | HelpCategory) => void;
  readonly showCounts?: boolean;
}

export interface FAQListProps {
  readonly faqs: readonly FAQ[];
  readonly openFaq: number | null;
  readonly onFaqToggle: (id: number) => void;
  readonly isLoading?: boolean;
  readonly emptyMessage?: string;
}

export interface FAQItemProps {
  readonly faq: FAQ;
  readonly isOpen: boolean;
  readonly onToggle: (id: number) => void;
  readonly index: number;
}

export interface QuickLinksProps {
  readonly links: readonly QuickLink[];
  readonly title?: string;
}

export interface HelpHeaderProps {
  readonly title: string;
  readonly subtitle: string;
  readonly showSearch?: boolean;
  readonly searchProps?: SearchBarProps;
}

// ========================================
// State Management
// ========================================

export interface HelpState {
  readonly faqs: readonly FAQ[];
  readonly categories: readonly HelpCategoryInfo[];
  readonly quickLinks: readonly QuickLink[];
  readonly searchState: SearchState;
  readonly openFaq: number | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly analytics: {
    readonly totalViews: number;
    readonly totalSearches: number;
    readonly popularTopics: readonly string[];
  };
}

export type HelpAction =
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_CATEGORY'; payload: 'all' | HelpCategory }
  | { type: 'TOGGLE_FAQ'; payload: number }
  | { type: 'SEARCH_START' }
  | { type: 'SEARCH_SUCCESS'; payload: readonly FAQ[] }
  | { type: 'SEARCH_ERROR'; payload: string }
  | { type: 'LOAD_FAQS_START' }
  | { type: 'LOAD_FAQS_SUCCESS'; payload: readonly FAQ[] }
  | { type: 'LOAD_FAQS_ERROR'; payload: string }
  | { type: 'TRACK_VIEW'; payload: { faqId: number } }
  | { type: 'VOTE_HELPFUL'; payload: { faqId: number; helpful: boolean } };

// ========================================
// Service Interfaces
// ========================================

export interface HelpService {
  readonly getFAQs: (filters?: SearchFilters) => Promise<readonly FAQ[]>;
  readonly searchFAQs: (query: string, filters?: SearchFilters) => Promise<readonly FAQ[]>;
  readonly getCategories: () => Promise<readonly HelpCategoryInfo[]>;
  readonly getQuickLinks: () => Promise<readonly QuickLink[]>;
  readonly trackView: (faqId: number) => Promise<void>;
  readonly voteHelpful: (faqId: number, helpful: boolean) => Promise<void>;
  readonly submitFeedback: (feedback: HelpFeedback) => Promise<void>;
}

export interface HelpFeedback {
  readonly type: 'bug' | 'suggestion' | 'question' | 'compliment';
  readonly title: string;
  readonly description: string;
  readonly category?: HelpCategory;
  readonly email?: string;
  readonly priority?: 'low' | 'medium' | 'high';
}

// ========================================
// Animation Types
// ========================================

export interface HelpAnimationVariants {
  readonly container: {
    readonly hidden: { opacity: number };
    readonly visible: {
      readonly opacity: number;
      readonly transition: {
        readonly staggerChildren: number;
        readonly delayChildren: number;
      };
    };
  };
  readonly item: {
    readonly hidden: { y: number; opacity: number };
    readonly visible: {
      readonly y: number;
      readonly opacity: number;
      readonly transition: {
        readonly type: string;
        readonly stiffness: number;
        readonly damping: number;
      };
    };
  };
}

// ========================================
// Utility Types
// ========================================

export type HelpSearchResult = FAQ & {
  readonly relevanceScore: number;
  readonly matchType: 'question' | 'answer' | 'tag';
  readonly excerpt: string;
};

export interface HelpAnalytics {
  readonly popularQuestions: readonly { faq: FAQ; views: number }[];
  readonly searchTerms: readonly { term: string; count: number }[];
  readonly categoryDistribution: Record<HelpCategory, number>;
  readonly helpfulnessRating: number;
}