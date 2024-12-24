import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Error caught by error boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-5">
          <div className="alert alert-danger">
            <h4>Etwas ist schief gelaufen</h4>
            <p>Die Seite wird automatisch neu geladen in 5 Sekunden...</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Jetzt neu laden
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo?.componentStack}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.hasError && !prevState.hasError) {
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    }
  }
}

export default ErrorBoundary;