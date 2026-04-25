import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { ensurePiInit } from "./lib/pi";

// Best-effort early init; will be retried on the sign-in click.
ensurePiInit().catch(() => {
  /* SDK may not be ready yet; click handler will retry. */
});

createRoot(document.getElementById("root")!).render(<App />);
