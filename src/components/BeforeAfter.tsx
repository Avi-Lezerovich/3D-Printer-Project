import { useRef, useState, useEffect } from 'react'
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
      document.addEventListener('touchmove', handleGlobalMove);
      document.addEventListener('touchend', handleGlobalEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMove);
      document.removeEventListener('mouseup', handleGlobalEnd);
      document.removeEventListener('touchmove', handleGlobalMove);
      document.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [isDragging]);

  return (
    <div 
      className={`before-after ${isDragging ? 'dragging' : ''}`}
      ref={containerRef} 
      onMouseMove={onMove}
      onTouchMove={onMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <img className="img after" src={after} alt={altAfter} />
      <div className="clip" style={{width: `${pos}%`}}>
        <img className="img before" src={before} alt={altBefore} />
      </div>
      
      {showLabels && (
        <>
          <div className="label label-before">
            <span>{altBefore}</span>
          </div>
          <div className="label label-after">
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
      >
        <span className="handle-icon">⟷</span>
        <div className="handle-line" />
      </div>
      
      {!isDragging && !isHovering && autoSlide && (
        <div className="auto-slide-hint">
          <span>Drag to compare • Auto-demo active</span>
        </div>
      )}
    </div>
  )
}
