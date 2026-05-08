import { createRoot } from "react-dom/client";
import "./i18n"; // Initialize i18n before app renders
import App from "./App.tsx";
import "./index.css";
import AppErrorBoundary from "./components/layout/AppErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
