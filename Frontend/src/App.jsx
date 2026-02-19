
import { BrowserRouter, Routes, Route } from "react-router-dom";
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



// import "./App1.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<Login />} />

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

          

        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;