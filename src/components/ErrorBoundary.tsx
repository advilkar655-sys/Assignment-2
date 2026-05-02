/**
 * @fileoverview React Error Boundary component for catching and displaying runtime errors.
 * Wraps the application to prevent a single component failure from crashing the entire UI.
 */

import { Component, type ErrorInfo } from 'react';
import type { ErrorBoundaryProps, ErrorBoundaryState } from '../types';

/**
 * Class-based Error Boundary that catches JavaScript errors anywhere in its
 * child component tree, logs those errors, and displays a fallback UI.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  /** Updates state so the next render shows the fallback UI. */
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /** Logs error details to the console for debugging. */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          className="glass-panel"
          role="alert"
          aria-live="assertive"
          style={{ padding: '2rem', textAlign: 'center', margin: '2rem' }}
        >
          <h2>Something went wrong.</h2>
          <p>We apologize for the inconvenience. Please refresh the page and try again.</p>
          {this.state.error && (
            <pre
              style={{
                textAlign: 'left',
                background: 'rgba(0,0,0,0.5)',
                padding: '1rem',
                overflowX: 'auto',
                borderRadius: '8px',
              }}
            >
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
