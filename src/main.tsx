import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { applyQaFromLocation } from "./qa/applyScene";
import "./styles/app.css";

applyQaFromLocation();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
