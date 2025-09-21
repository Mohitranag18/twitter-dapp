// src/components/ErrorBoundary.js
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex justify-center items-center min-h-[200px] p-5">
          <div className="bg-white/95 backdrop-blur-sm border border-red-200 rounded-2xl p-8 text-center max-w-lg w-full shadow-lg">
            <h2 className="text-red-500 text-2xl font-bold mb-4">🚨 Something went wrong</h2>
            <p className="text-gray-700 mb-6">An error occurred while rendering the component.</p>
            
            <details className="text-left mb-6 p-4 bg-gray-50 rounded-lg">
              <summary className="cursor-pointer font-medium text-gray-800 hover:text-gray-600">
                Error Details (Click to expand)
              </summary>
              <div className="mt-3 text-sm text-gray-600 font-mono whitespace-pre-wrap">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </div>
            </details>
            
            <div className="flex gap-4 justify-center">
              <button 
                onClick={this.handleRetry} 
                className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-medium transition-all duration-300 hover:-translate-y-0.5"
              >
                🔄 Try Again
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium transition-all duration-300 hover:-translate-y-0.5"
              >
                🔃 Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
