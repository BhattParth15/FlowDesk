import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import { PermissionProvider } from "./context/PermissionContext";
import { BrowserRouter } from "react-router-dom";
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PermissionProvider>
      <App />
    </PermissionProvider>
  </StrictMode>
)
