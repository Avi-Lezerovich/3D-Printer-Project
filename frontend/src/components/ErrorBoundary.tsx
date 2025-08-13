import { Component, ErrorInfo, ReactNode } from "react";
import { Link } from "react-router-dom";
import '../styles/error-boundary.css';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <h1>Something went wrong.</h1>
          <p>We're sorry for the inconvenience. Please try refreshing the page, or go back to the homepage.</p>
          <Link to="/" onClick={() => this.setState({ hasError: false })}>
            Go to Homepage
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
