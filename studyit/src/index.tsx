import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };
  declare props: Readonly<ErrorBoundaryProps>;

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center', backgroundColor: '#FEF2F2', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#DC2626', marginBottom: '1rem' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#991B1B', marginBottom: '0.5rem' }}>Something went wrong</h1>
          <p style={{ color: '#7F1D1D', maxWidth: '400px', margin: '0 auto' }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children || null;
  }
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);