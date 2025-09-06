
import './loading-fallback.css';

interface LoadingFallbackProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingFallback({ 
  message = 'Loading...', 
  size = 'md' 
}: LoadingFallbackProps) {
  return (
    <div className="loading-fallback" data-size={size}>
      <div className="loading-spinner" />
      <p className="loading-message">{message}</p>
    </div>
  );
}