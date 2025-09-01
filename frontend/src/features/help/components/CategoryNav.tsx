import React from 'react';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategory,
  onCategoryChange
}) => {
  return (
    <div className="category-nav">
      <h3 className="category-title">Categories</h3>
      <div className="category-list">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            className={`category-button ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="category-name">{category.name}</span>
            <span className="category-count">{category.count}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CategoryNav;