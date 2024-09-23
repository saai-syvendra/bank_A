import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRoutes from "./AppRoutes.jsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { OTPProvider } from "./auth/OtpContext.jsx";

createRoot(document.getElementById("root")).render(
  //<StrictMode>
  <OTPProvider>
    <BrowserRouter>
      <AppRoutes />
      <Toaster visibleToasts={1} position="bottom-right" richColors />
    </BrowserRouter>
  </OTPProvider>
  //</StrictMode>
);
