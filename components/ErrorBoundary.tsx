"use client";

import React, { ReactNode, ReactElement, Component, ErrorInfo } from "react";
import { Card, Button } from "@heroui/react";

interface Props {
  children: ReactNode;
  fallback?: ReactElement;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch React errors
 * Displays a user-friendly error message and allows recovery
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <div className="p-6">
                <h1 className="text-2xl font-bold text-red-600 mb-2">
                  Oops! Something went wrong
                </h1>
                <p className="text-gray-600 mb-4">
                  An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
                </p>

                {process.env.NODE_ENV === "development" && this.state.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                    <details className="text-sm text-red-700">
                      <summary className="cursor-pointer font-semibold">
                        Error Details
                      </summary>
                      <pre className="mt-2 overflow-auto text-xs whitespace-pre-wrap break-words">
                        {this.state.error.toString()}
                        {"\n\n"}
                        {this.state.errorInfo?.componentStack}
                      </pre>
                    </details>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onPress={this.handleReset}
                    className="flex-1 bg-primary text-white"
                  >
                    Try Again
                  </Button>
                  <Button
                    onPress={() => window.location.href = "/"}
                    className="flex-1 border border-gray-300"
                  >
                    Home
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
