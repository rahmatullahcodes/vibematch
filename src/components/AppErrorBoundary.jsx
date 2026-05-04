import React from "react";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message ?? "Unexpected runtime error.",
    };
  }

  componentDidCatch(error) {
    console.error("App render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mesh-bg min-h-screen bg-slateDeep font-body text-slate-100">
          <div className="grid min-h-screen place-items-center px-4">
            <div className="glass-strong max-w-lg rounded-3xl p-6 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Runtime Error</p>
              <h1 className="mt-2 font-heading text-3xl text-white">Something went wrong</h1>
              <p className="mt-3 text-sm text-red-100">{this.state.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-5 rounded-2xl bg-gradient-to-r from-coral to-ember px-5 py-2 text-sm font-semibold text-white"
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
