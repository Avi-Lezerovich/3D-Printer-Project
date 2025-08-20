import { Component, ErrorInfo, ReactNode } from 'react';
import Scene3DFallback from './Scene3DFallback';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class Scene3DErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Scene3D Error:', error, info);
    // Don't let 3D errors bubble up to the main error boundary
  }

  public render() {
    if (this.state.hasError) {
      return <Scene3DFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

export default Scene3DErrorBoundary;