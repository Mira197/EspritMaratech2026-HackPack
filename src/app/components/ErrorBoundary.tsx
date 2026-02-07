import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  language?: 'fr' | 'ar';
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isFrench = this.props.language === 'fr' || !this.props.language;
      
      return (
        <div 
          className="min-h-screen flex items-center justify-center bg-red-50 p-6"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-2xl bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-8xl mb-6" aria-hidden="true">⚠️</div>
            <h1 className="text-5xl mb-6">
              {isFrench ? 'Une erreur est survenue' : 'حدث خطأ'}
            </h1>
            <p className="text-3xl mb-8 text-gray-600">
              {isFrench 
                ? 'L\'application a rencontré un problème. Veuillez rafraîchir la page.'
                : 'واجه التطبيق مشكلة. يرجى تحديث الصفحة.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-12 py-6 bg-blue-600 text-white rounded-xl text-3xl hover:bg-blue-700 focus:ring-8 focus:ring-blue-300 focus:outline-none"
              aria-label={isFrench ? 'Rafraîchir la page' : 'تحديث الصفحة'}
            >
              {isFrench ? 'Rafraîchir' : 'تحديث'}
            </button>
            {this.state.error && (
              <details className="mt-8 text-left">
                <summary className="text-2xl cursor-pointer mb-4">
                  {isFrench ? 'Détails techniques' : 'تفاصيل تقنية'}
                </summary>
                <pre className="text-xl bg-gray-100 p-4 rounded-lg overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
