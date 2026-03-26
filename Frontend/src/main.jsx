import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import { PermissionProvider } from "./context/PermissionContext";
import { AuthProvider } from './context/AuthContext.jsx';
import { BrowserRouter } from "react-router-dom";
import { ConfirmModalProvider } from './context/DeleteConfirmContext.jsx';
import { ProjectProvider } from './context/ProjectContext.jsx';
import { CompanyProvider } from './context/companyContext.jsx';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <PermissionProvider>
        <ConfirmModalProvider>
          <ProjectProvider>
            <CompanyProvider>
              <App />
            </CompanyProvider>
          </ProjectProvider>
        </ConfirmModalProvider>
      </PermissionProvider>
    </AuthProvider>
  </StrictMode>
)
