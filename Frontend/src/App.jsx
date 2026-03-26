
import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";
import Layout from "./components/layout.jsx"
import Login from "./pages/superAdmin_Login.jsx";
import Staff from "./pages/Staff.jsx";
import Dashboard from "./pages/Dashboard.jsx";

// Role Pages
import Role from "./pages/Role.jsx";
import CreateRole from "./CreatePage/RoleCreate.jsx"; 

// Permission Pages
import Permission from "./pages/Permission.jsx";
import PermissionForm from "./CreatePage/PermissionForm.jsx";

import Tasks from "./pages/Task.jsx";
import TaskStatus from "./pages/TaskStatus.jsx";
import Profile from "./pages/Profile.jsx";

import CreateStaff from "./CreatePage/CreateStaff.jsx";
import CreateTaskStatus from "./CreatePage/CreateTaskStatus.jsx";
import CreateTask from "./CreatePage/CreateTask.jsx";

import Project from "./pages/Project.jsx";
import CreateProject from "./CreatePage/CreateProject.jsx";
import Team from "./pages/Team.jsx";
import TaskIssue from "./pages/Issue.jsx";
import CreateTaskIssue from "./CreatePage/CreateIssue.jsx";

import Document from "./pages/Document.jsx";
import CreateDocument from "./CreatePage/CreateDocument.jsx";
import ViewDocument from "./View/DocumentView.jsx";
import AccessReview from "./View/AccessReview.jsx";
import CreateTextDocument from "./CreatePage/CreateTextDocument.jsx";

import CreateBulkUpload from "./CreatePage/CreateBulkUpload.jsx";
import CompanyRegister from "./pages/CompanyRegistrationForm.jsx";
import Company from "./pages/CompanyData.jsx";

import Subcription from "./pages/Subcription.jsx";
import SubcriptionForm from "./CreatePage/CreateSubcription.jsx";
import CompanyProfile from "./CreatePage/CompanyProfile.jsx";

// import "./App1.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/company-register" element={<CompanyRegister />} />

        {/* Protected Layout Routes */}
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="staff" element={<Staff />} />
          <Route path="staff/create" element={<CreateStaff/>}/>
          <Route path="staff/edit/:id" element={<CreateStaff/>}/>
          <Route path="profile" element={<Profile />} />
          
          {/* Permission Routes */}
          <Route path="permission" element={<Permission />} />
          <Route path="permission/create" element={<PermissionForm />} />
          <Route path="permission/edit/:id" element={<PermissionForm />} />

          {/* Role Routes */}
          <Route path="role" element={<Role />} />
          <Route path="role/create" element={<CreateRole />} />
          <Route path="role/edit/:id" element={<CreateRole />} />

          <Route path="task" element={<Tasks />} />
          <Route path="task/create" element={<CreateTask/>} />
          <Route path="task/edit/:id" element={<CreateTask/>} />


          <Route path="taskstatus" element={<TaskStatus />} />
          <Route path="taskstatus/create" element={<CreateTaskStatus/>}/>
          <Route path="taskstatus/edit/:id" element={<CreateTaskStatus/>}/>

          <Route path="project" element={<Project/>}/>
          <Route path="project/create" element={<CreateProject/>}/>
          <Route path="project/edit/:id" element={<CreateProject/>}/>

          <Route path="team" element={<Team/>}/>
          <Route path="issue" element={<TaskIssue/>}/>
          <Route path="issue/create" element={<CreateTaskIssue/>} />
          <Route path="issue/edit/:id" element={<CreateTaskIssue/>} />

          <Route path="document" element={<Document/>}/>
          <Route path="document/create" element={<CreateDocument/>} />
          <Route path="document/edit/:id" element={<CreateDocument/>} />
          <Route path="document/view/:id" element={<ViewDocument />} />
          <Route path="document/request-review/:documentId" element={<AccessReview />} />
          <Route path="document/create-text" element={<CreateTextDocument />} />
          <Route path="document/page/:id" element={<CreateTextDocument />} />
          <Route path="document/view-text/:id" element={<CreateTextDocument />} />

          <Route path="bulk/upload" element={<CreateBulkUpload />} />
          <Route path="company" element={<Company/>}/>
          <Route path="company-register/edit/:id" element={<CompanyRegister/>} />

          <Route path="subcription" element={<Subcription />} />
          <Route path="subcription/create" element={<SubcriptionForm />} />
          <Route path="subcription/edit/:id" element={<SubcriptionForm />} />

          <Route path="company-profile" element={<CompanyProfile />} />

          

        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;