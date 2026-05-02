import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', margin: '2rem' }}>
          <h2>Something went wrong.</h2>
          <p>We apologize for the inconvenience. Please refresh the page and try again.</p>
          {this.state.error && (
            <pre style={{ textAlign: 'left', background: 'rgba(0,0,0,0.5)', padding: '1rem', overflowX: 'auto' }}>
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
