import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { PWAUpdatePrompt } from "./components/PWAUpdatePrompt";

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <PWAUpdatePrompt />
  </>
);
