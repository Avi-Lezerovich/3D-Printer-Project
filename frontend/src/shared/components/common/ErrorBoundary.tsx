import { Component, ErrorInfo, ReactNode } from "react";
import { Link } from "react-router-dom";
import '../styles/error-boundary.css';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorId: string | null;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: number | null = null;

  public state: State = {
    hasError: false,
    errorId: null,
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      retryCount: 0,
    };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      errorBoundary: this.constructor.name,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
    };

    console.error("ErrorBoundary caught an error:", errorDetails);
    
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to logging service like Sentry, LogRocket, etc.
      // Example: Sentry.captureException(error, { extra: errorDetails });
    }
  }

  public componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private handleRetry = () => {
    this.setState(prevState => ({ 
      hasError: false, 
      errorId: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  private handleAutoRetry = () => {
    if (this.state.retryCount < 3) {
      this.retryTimeoutId = window.setTimeout(() => {
        this.handleRetry();
      }, 2000);
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { retryCount, errorId } = this.state;
      const canRetry = retryCount < 3;

      return (
        <div className="error-boundary-container">
          <div className="error-content">
            <h1>Something went wrong</h1>
            <p>We're sorry for the inconvenience. The application encountered an unexpected error.</p>
            
            {errorId && (
              <details className="error-details">
                <summary>Error Details</summary>
                <p><strong>Error ID:</strong> {errorId}</p>
                <p><strong>Retry Count:</strong> {retryCount}</p>
              </details>
            )}

            <div className="error-actions">
              {canRetry && (
                <button 
                  onClick={this.handleRetry}
                  className="retry-button"
                  type="button"
                >
                  Try Again {retryCount > 0 && `(${retryCount}/3)`}
                </button>
              )}
              
              <button 
                onClick={() => window.location.reload()}
                className="refresh-button"
                type="button"
              >
                Refresh Page
              </button>
              
              <Link 
                to="/" 
                onClick={() => this.setState({ hasError: false, errorId: null, retryCount: 0 })}
                className="home-link"
              >
                Go to Homepage
              </Link>
            </div>

            {retryCount >= 3 && (
              <div className="error-persistent">
                <p>This error persists after multiple attempts. Please refresh the page or contact support if the problem continues.</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
