import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AppErrorBoundary from "./components/AppErrorBoundary";
import "./index.css";

const CHUNK_RELOAD_KEY = "spark_chunk_reload_once";

function isChunkLoadFailure(message) {
  const text = String(message || "").toLowerCase();
  return (
    text.includes("failed to fetch dynamically imported module") ||
    text.includes("importing a module script failed") ||
    text.includes("loading chunk")
  );
}

function recoverFromChunkFailure(message) {
  if (!isChunkLoadFailure(message)) {
    return;
  }

  try {
    const alreadyReloaded = window.sessionStorage.getItem(CHUNK_RELOAD_KEY) === "1";
    if (!alreadyReloaded) {
      window.sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
      window.location.reload();
      return;
    }
    window.sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  } catch {
    // Ignore recovery storage errors.
  }
}

window.addEventListener("error", (event) => {
  recoverFromChunkFailure(event?.error?.message || event?.message);
});

window.addEventListener("unhandledrejection", (event) => {
  recoverFromChunkFailure(event?.reason?.message || event?.reason);
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>,
);
