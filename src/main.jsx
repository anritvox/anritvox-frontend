import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import "./index.css";
import App from "./App.jsx";
import { SettingsProvider } from "./context/SettingsContext";

const reCaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey}>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </GoogleReCaptchaProvider>
  </StrictMode>
);
