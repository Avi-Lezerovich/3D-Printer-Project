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

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught error:", error, info);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <h1>Something went wrong.</h1>
          <p>We&apos;re sorry for the inconvenience. Please try refreshing the page, or return to the homepage.</p>
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
