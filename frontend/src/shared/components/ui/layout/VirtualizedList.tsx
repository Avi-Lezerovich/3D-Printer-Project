import React from 'react';
import { useVirtualList } from '../../../../hooks/useVirtualList';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

export default function VirtualizedList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  className = '',
  overscan = 5
}: VirtualizedListProps<T>) {
  const {
    scrollElementRef,
    visibleItems,
    totalHeight,
    getItemStyle
  } = useVirtualList({
    itemHeight,
    containerHeight: height,
    overscan,
    items
  });

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
    >
      <div
        style={{ height: totalHeight, position: 'relative' }}
      >
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={getItemStyle(index)}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}