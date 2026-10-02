import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertTriangle size={48} className="text-rose-400 mb-4" />
          <h3 className="text-lg font-semibold text-th-secondary mb-2">Something went wrong</h3>
          <p className="text-sm text-th-muted max-w-md mb-4">
            {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 text-white text-sm rounded-md transition-colors"
            style={{ backgroundColor: 'var(--bb-accent)' }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
