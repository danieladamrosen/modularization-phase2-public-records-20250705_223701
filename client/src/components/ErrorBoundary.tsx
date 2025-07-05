import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('🛑 ErrorBoundary caught an error:', error);
    console.error('🛑 Error message:', error.message);
    console.error('🛑 Error stack:', error.stack);
    
    // Send to save flow monitor if available
    if (typeof (window as any).saveFlowMonitor !== 'undefined') {
      (window as any).saveFlowMonitor.capture?.('error', `React ErrorBoundary: ${error.message}`);
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🛑 ErrorBoundary componentDidCatch:', error, errorInfo);
    console.error('🛑 Component stack:', errorInfo.componentStack);
    
    // Send detailed error info to monitor
    if (typeof (window as any).saveFlowMonitor !== 'undefined') {
      (window as any).saveFlowMonitor.capture?.('error', `React Error Details: ${error.message} | Stack: ${errorInfo.componentStack}`);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ backgroundColor: 'red', color: 'white', padding: '20px', margin: '10px', borderRadius: '5px' }}>
          ❌ Error: {this.state.error?.message || 'Unknown error'}
          <div style={{ marginTop: '10px', fontSize: '12px', fontFamily: 'monospace' }}>
            {this.state.error?.stack || 'No stack trace available'}
          </div>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: '10px', padding: '5px 10px', backgroundColor: 'darkred', color: 'white', border: 'none', borderRadius: '3px' }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}