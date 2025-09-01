import { useRef, useState, useEffect } from 'react'
import { Image } from '../shared/components/ui/layout'
import './beforeAfter.css'

type Props = { 
  before: string; 
  after: string; 
  altBefore?: string; 
  altAfter?: string;
  autoSlide?: boolean;
  showLabels?: boolean;
}

export default function BeforeAfter({ 
  before, 
  after, 
  altBefore='Before', 
  altAfter='After',
  autoSlide = true,
  showLabels = true
}: Props){
  const containerRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // Auto-slide demonstration effect
  useEffect(() => {
    if (!autoSlide || isDragging || isHovering) return;
    
    const interval = setInterval(() => {
      setPos(prev => {
        if (prev >= 95) return 5;
        return prev + 1;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [autoSlide, isDragging, isHovering]);

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging && e.type !== 'mousemove') return;
    
    const el = containerRef.current
    if(!el) return
    
    const rect = el.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const pct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100))
    setPos(pct)
  }

  const onStart = () => {
    setIsDragging(true);
  }

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const el = containerRef.current;
      if (!el) return;
      
      const rect = el.getBoundingClientRect();
      const clientX = e.type.includes('touch') 
        ? (e as TouchEvent).touches[0].clientX 
        : (e as MouseEvent).clientX;
      const pct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
      setPos(pct);
    };

    const handleGlobalEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMove);
      document.addEventListener('mouseup', handleGlobalEnd);
      document.addEventListener('touchmove', handleGlobalMove, { passive: true });
      document.addEventListener('touchend', handleGlobalEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMove);
      document.removeEventListener('mouseup', handleGlobalEnd);
      document.removeEventListener('touchmove', handleGlobalMove);
      document.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [isDragging]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 5;
    if (e.key === 'ArrowLeft' || e.key === 'Left') {
      e.preventDefault();
      setPos(p => Math.max(5, p - step));
    }
    if (e.key === 'ArrowRight' || e.key === 'Right') {
      e.preventDefault();
      setPos(p => Math.min(95, p + step));
    }
    if (e.key === 'Home') {
      e.preventDefault();
      setPos(5);
    }
    if (e.key === 'End') {
      e.preventDefault();
      setPos(95);
    }
  }

  return (
    <div 
      className={`before-after ${isDragging ? 'dragging' : ''}`}
      ref={containerRef} 
      onMouseMove={onMove}
      onTouchMove={onMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
  <Image className="img after fluid-img" src={after} alt={altAfter} />
      <div className="clip" style={{width: `${pos}%`}}>
  <Image className="img before fluid-img" src={before} alt={altBefore} />
      </div>
      
      {showLabels && (
        <>
          <div className="label label-before" aria-hidden>
            <span>{altBefore}</span>
          </div>
          <div className="label label-after" aria-hidden>
            <span>{altAfter}</span>
          </div>
        </>
      )}
      
      <div 
        className="handle" 
        style={{left: `${pos}%`}}
        onMouseDown={onStart}
        onTouchStart={onStart}
        role="slider"
        aria-valuenow={Math.round(pos)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Drag to compare before and after"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <span className="handle-icon">⟷</span>
        <div className="handle-line" />
      </div>
      
      {!isDragging && !isHovering && autoSlide && (
        <div className="auto-slide-hint" aria-live="polite">
          <span>Drag to compare • Auto-demo active</span>
        </div>
      )}
    </div>
  )
}
