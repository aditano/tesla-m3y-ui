import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { applyQaFromLocation } from "./qa/applyScene";
import { useVehicle } from "./state/store";
import "./styles/app.css";

applyQaFromLocation();

if (import.meta.env.DEV) {
  (window as Window & { __vehicle?: typeof useVehicle }).__vehicle = useVehicle;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
