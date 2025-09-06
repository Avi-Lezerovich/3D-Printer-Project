import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver({
  threshold = 0.1,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false
}: UseIntersectionObserverOptions = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const frozen = useRef(false);

  const updateEntry = useCallback(([entry]: IntersectionObserverEntry[]) => {
    if (frozen.current) return;
    
    setEntry(entry);
    setIsVisible(entry.isIntersecting);
    
    if (freezeOnceVisible && entry.isIntersecting) {
      frozen.current = true;
    }
  }, [freezeOnceVisible]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const hasIOSupport = !!window.IntersectionObserver;
    if (!hasIOSupport) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(updateEntry, {
      threshold,
      root,
      rootMargin
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [updateEntry, threshold, root, rootMargin]);

  return {
    ref: elementRef,
    entry,
    isVisible,
    isIntersecting: entry?.isIntersecting ?? false
  };
}