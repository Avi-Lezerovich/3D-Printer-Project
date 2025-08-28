import { useState, useEffect, useRef, useMemo } from 'react';
import { throttle } from '../utils/performanceOptimization';

interface UseVirtualListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  items: any[];
}

export function useVirtualList<T>({
  itemHeight,
  containerHeight,
  overscan = 5,
  items
}: UseVirtualListOptions) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    const itemCount = items.length;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    const totalHeight = itemCount * itemHeight;

    return { startIndex, endIndex, totalHeight };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }));
  }, [items, startIndex, endIndex]);

  const throttledSetScrollTop = useMemo(
    () => throttle((scrollTop: number) => setScrollTop(scrollTop), 16),
    []
  );

  useEffect(() => {
    const scrollElement = scrollElementRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      throttledSetScrollTop(scrollElement.scrollTop);
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [throttledSetScrollTop]);

  const getItemStyle = (index: number) => ({
    position: 'absolute' as const,
    top: index * itemHeight,
    left: 0,
    right: 0,
    height: itemHeight,
  });

  return {
    scrollElementRef,
    visibleItems,
    totalHeight,
    getItemStyle,
    startIndex,
    endIndex
  };
}