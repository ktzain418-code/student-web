import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("App History crashed", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="fatal-screen">
        <div className="fatal-card">
          <h1>Something went wrong</h1>
          <p>
            App History ran into an unexpected problem and stopped. Your saved history is not affected.
          </p>
          <button className="btn btn-primary btn-block" type="button" onClick={() => window.location.reload()}>
            Restart App History
          </button>
        </div>
      </div>
    );
  }
}
