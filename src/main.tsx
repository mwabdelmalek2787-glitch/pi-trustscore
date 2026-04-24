import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ensurePiInit } from "./lib/pi";

// Initialise the Pi SDK as early as possible (no-op outside Pi Browser).
ensurePiInit();

createRoot(document.getElementById("root")!).render(<App />);
