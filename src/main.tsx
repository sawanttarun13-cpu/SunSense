/**
 * ─────────────────────────────────────────────────────────────────────────────
 * File: main.tsx
 * Layer: Frontend Entry Point
 *
 * Purpose:
 * The Vite/React application entry point. Mounts the root <App /> component
 * into the #root DOM element defined in index.html, and imports the global
 * stylesheet so it is bundled with the application.
 *
 * This file is intentionally minimal — all application structure, routing,
 * and providers are defined in App.tsx.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";

/**
 * Mount the React application into the DOM.
 * The `!` non-null assertion is safe here because index.html
 * always contains a <div id="root"> element.
 */
createRoot(document.getElementById("root")!).render(<App />);