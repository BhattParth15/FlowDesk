import { Link } from "react-router-dom";
import Profile from "../pages/Profile";
import logo from "../assets/logo.png";
import ProfilePicture from "../assets/Picture.png";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

import { useState, useEffect, useRef } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { useConfirmModal } from "../context/DeleteConfirmContext.jsx";
import { useProject } from "../context/ProjectContext.jsx";
import { useCompany } from "../context/companyContext.jsx";
import { usePermission } from "../context/PermissionContext.jsx";
const API_URL = import.meta.env.VITE_API_URL;

function Navbar({ toggleSidebar }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef();
  const { user, logout } = useContext(AuthContext);
  const { showConfirm } = useConfirmModal();
  const [projects, setProjects] = useState([]);
  const { selectedProject, setSelectedProject } = useProject();
  const [company, setCompany] = useState([]);
  const { selectedCompany, setSelectedCompany } = useCompany();
  const { hasPermission } = usePermission();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (hasPermission("project.read")) {
      fetchProject();
    }
    if (hasPermission("company.read")) {
      fetchCompany();
    }
  }, [hasPermission])

  useEffect(() => {
    const savedProject = localStorage.getItem("selectedProject");

    if (savedProject) {
      setSelectedProject(JSON.parse(savedProject));
    }
  }, []);
  useEffect(() => {
    const savedCompany = localStorage.getItem("selectedCompany");
    if (savedCompany) {
      setSelectedCompany(JSON.parse(savedCompany));
    }
  }, []);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);


  }, []);

  const fetchProject = async () => {
    try {
      const res = await axios.get(`${API_URL}/project?page=1&limit=1000`, { withCredentials: true });
      setProjects(res.data.projects);
    }
    catch (error) {
      console.log(error);
    }
  }

  const fetchCompany = async () => {
    try {
      const res = await axios.get(`${API_URL}/company?page=1&limit=1000`, { withCredentials: true });
      setCompany(res.data.company);
    }
    catch (error) {
      console.log(error);
    }
  }
  const handleProjectChange = (projectId) => {
    if (!projectId) {
      setSelectedProject(null);
      localStorage.removeItem("selectedProject");
      return;
    }
    if (projectId === "all") {
      const allProject = { _id: "all", name: "All", projectIds: projects.map(p => p._id) };
      setSelectedProject(allProject);
      localStorage.setItem("selectedProject", JSON.stringify(allProject));
      return;
    }

    const project = projects.find(p => p._id === projectId);

    if (!project) return;

    setSelectedProject(project);
    localStorage.setItem("selectedProject", JSON.stringify(project));

  };
  const handleCompanyChange = (companyId) => {
    if (!companyId) {
      setSelectedCompany(null);
      localStorage.removeItem("selectedCompany");
      return;
    }

    if (companyId === "all") {
      const allCompany = {
        _id: "all",
        companyName: "All"
      };

      setSelectedCompany(allCompany);
      localStorage.setItem("selectedCompany", JSON.stringify(allCompany));
      return;
    }

    const com = company.find(c => c._id === companyId);
    if (!com) return;

    setSelectedCompany(com);
    localStorage.setItem("selectedCompany", JSON.stringify(com));
  };

  return (
    <header className="w-full h-20 sm:h-15 bg-white flex items-center justify-between px-4 mr-6 md:px-6 text-black z-500 lg:ml-4">
      <div className="flex items-center gap-3">

        {/* Hamburger Button - Mobile Only */}
        <button
          className="lg:hidden text-2xl"
          onClick={toggleSidebar}
        >
          ☰
        </button>

        {/* Logo */}
        <div className="w-7 h-7 lg:hidden">
          <img src={logo} alt="logo" className="w-full h-full object-contain" />
        </div>

        {/* Title */}
        <h6 className=" lg:hidden text-sm md:text-lg font-semibold tracking-wide ">
          FlowDesk
        </h6>

      </div>
      <div className="hidden md:flex items-center gap-2 mr-auto">
        <select
          value={selectedProject?._id || "all"}
          onChange={(e) => handleProjectChange(e.target.value)}
          className="border px-3 py-1 rounded-md"
        >
          <option value="all">All</option>
          {projects.map(project => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
        {user?.isSuperAdmin === true && (
          <select
            value={selectedCompany?._id || "all"}
            onChange={(e) => handleCompanyChange(e.target.value)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="all">All</option>
            {company.map(com => (
              <option key={com._id} value={com._id}>
                {com.companyName}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-5">
        {/* Icons from screenshot: Search, Grid, etc (Optional placeholders) */}
        <div className="relative p-4" ref={dropdownRef}>
          <div
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <span className="hidden sm:block font-medium text-sm">
              Welcome, {user?.name || "User"}
            </span>
            {/* User Avatar Style */}
            <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden bg-gray-200">
              <img src={ProfilePicture} alt="user" />
            </div>
          </div>
          <div className="relative">
            {open && (
              <div className="absolute right-0  w-48 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-100 py-2">
                <div
                  onClick={() => { navigate("/profile"); setOpen(false); }}
                  className="px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
                >
                  My Profile
                </div>
                {user?.isSuperAdmin === false && (
                  <div>
                    <hr className="my-1 border-gray-100" />
                    <div
                      onClick={() => { navigate("/company-profile"); setOpen(false); }}
                      className="px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      Company Profile
                    </div>
                  </div>
                )}
                <hr className="my-1 border-gray-100" />
                <div
                  onClick={() =>
                    showConfirm({
                      id: "logout",
                      name: "your account",
                      onConfirm: logout,
                    })
                  }
                  className="px-4 py-2 hover:bg-red-50 cursor-pointer text-red-500 transition-colors"
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
export default Navbar;