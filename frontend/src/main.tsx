import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="713855905456-pusahj8742plc7gc90od9bi4kpbaflq9.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
