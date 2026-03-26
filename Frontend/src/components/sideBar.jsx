import { Link } from "react-router-dom";
import { useState, useEffect,useContext } from "react";
import logo from "../assets/logo.png";
import { usePermission } from "../context/PermissionContext";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useCompany } from "../context/companyContext";
import { AuthContext } from "../context/AuthContext";
const API_URL = import.meta.env.VITE_API_URL;

function Sidebar({ closeSidebar }) {
    const [openSettings, setOpenSettings] = useState(false);
    const [openProject, setOpenProjects] = useState(false);
    const [open, setOpen] = useState(false);
    const { hasPermission } = usePermission();
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    const { hasModule } = useCompany();
    const hasDashboard = hasModule("dashboard");
    const hasTeam = hasModule("team");
    const { user} = useContext(AuthContext);

    useEffect(() => {
        if (isActive("/project") || isActive("/task") || isActive("/team") || isActive("/issue") || isActive("/taskstatus") || isActive("/document")) {
            setOpenProjects(true);
        }
        if (isActive("/permission") || isActive("/subcription")) {
            setOpenSettings(true);
        }
    }, [isActive]);

    return (
        <aside className={`lg:static inset-y-0 left-0 z-50 w-64 h-full 
    bg-gradient-to-b from-purple-600 to-indigo-700 
    flex flex-col transition-transform duration-300 
    text-white shadow-xl overflow-y-auto`}>
            <div className="flex items-center gap-2 mb-2 border-b border-slate-500 pb-2 p-3">
                <img src={logo} className="w-8 h-7 object-contain" alt="logo" />
                <h3 className="hidden h-7 sm:block text-[10px] font-bold tracking-tight text-white font-sans italic">
                    Flow Desk
                </h3>
            </div>
            <div className="flex-1 space-y-1">
                {/* Manage Staff */}
                <Link
                    to={hasDashboard || user?.isSuperAdmin === true ? "/dashboard" : "#"}
                    onClick={closeSidebar}
                    className={`block mx-3 mt-2 py-2 text-white rounded-r-full transition-all duration-200 font-sans text-sm
                        ${isActive("/dashboard")
                            ? "bg-white/20 text-white shadow-md"
                            : "text-white/80 hover:bg-white/10 hover:text-white"} ${!hasDashboard && user?.isSuperAdmin === false ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                    🏠Dashboard
                </Link>
                {hasPermission("staff.read") && (
                    <Link
                        to="/staff"
                        onClick={closeSidebar}
                        className={`block mx-3 mt-2 py-2 text-white rounded-r-full transition-all duration-200 font-sans text-sm
                        ${isActive("/staff")
                                ? "bg-white/20 text-white shadow-md"
                                : "text-white/80 hover:bg-white/10 hover:text-white"}`}
                    >
                        👤Manage Staff
                    </Link>
                )}

                {/* Manage Role */}
                {hasPermission("role.read") && (
                    <Link
                        to="/role"
                        onClick={closeSidebar}
                        className={`block mx-3 mt-2 py-2 text-white rounded-r-full transition-all duration-200 font-sans text-sm
                        ${isActive("/role")
                                ? "bg-white/20 text-white shadow-md"
                                : "text-white/80 hover:bg-white/10 hover:text-white"}`}
                    >
                        🔑Manage Role
                    </Link>
                )}
                {hasPermission("company.read") && user?.isSuperAdmin === true && (
                    <Link
                        to="/company"
                        onClick={closeSidebar}
                        className={`block mx-3 mt-2 py-2 text-white rounded-r-full transition-all duration-200 font-sans text-sm
                        ${isActive("/company")
                                ? "bg-white/20 text-white shadow-md"
                                : "text-white/80 hover:bg-white/10 hover:text-white"}`}
                    >
                        🏭Companies
                    </Link>
                )}
                <div
                    onClick={() => setOpenProjects(!openProject)}
                    className={`block mx-3 mt-2 py-2 text-white rounded-r-full transition-all duration-200 hover:bg-white/10 font-sans text-sm `}
                >
                    👨🏼‍💻Project
                </div>
                {openProject && (
                    <div className="ml-6 space-y-1">
                        {/* Manage Task */}
                        {hasPermission("task.read") && (
                            <Link
                                to="/task"
                                onClick={closeSidebar}
                                className={`block mx-3 mt-2 py-2 text-white rounded-r-full transition-all duration-200 font-sans text-sm
                                ${isActive("/task")
                                        ? "bg-white/20 text-white shadow-md"
                                        : "text-white/80 hover:bg-white/10 hover:text-white"}`}
                            >
                                📝Manage Task
                            </Link>
                        )}
                        {hasPermission("project.read") && (
                            <Link
                                to="/project"
                                onClick={closeSidebar}
                                className={`block mx-3 mt-2 py-2 text-white rounded-r-full transition-all duration-200 font-sans text-sm
                                ${isActive("/project")
                                        ? "bg-white/20 text-white shadow-md"
                                        : "text-white/80 hover:bg-white/10 hover:text-white"}`}
                            >
                                👨🏼‍💻Manage Project
                            </Link>
                        )}
                        {hasPermission("team.read") && (
                            <Link
                                to={hasTeam || user?.isSuperAdmin === true ? "/team" : "#"}
                                onClick={closeSidebar}
                                className={`block mx-3 mt-2 py-2 text-white rounded-r-full transition-all duration-200 font-sans text-sm
                                ${isActive("/team")
                                        ? "bg-white/20 text-white shadow-md"
                                        : "text-white/80 hover:bg-white/10 hover:text-white"}${!hasTeam && user?.isSuperAdmin === false ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                👥Team
                            </Link>
                        )}
                        {hasPermission("issue.read") && (
                            <Link
                                to="/issue"
                                onClick={closeSidebar}
                                className={`block mx-3 mt-2 py-2 text-white rounded-r-full transition-all duration-200 font-sans text-sm
                                ${isActive("/issue")
                                        ? "bg-white/20 text-white shadow-md"
                                        : "text-white/80 hover:bg-white/10 hover:text-white"}`}
                            >
                                ⚠️Issue
                            </Link>
                        )}
                        {hasPermission("taskstatus.read") && (
                            <Link
                                to="/taskstatus"
                                onClick={closeSidebar}
                                className={`block mx-3 mt-2 py-2 text-white rounded-r-full transition-all duration-200 font-sans text-sm
                                ${isActive("/taskstatus")
                                        ? "bg-white/20 text-white shadow-md"
                                        : "text-white/80 hover:bg-white/10 hover:text-white"}`}
                            >
                                📊Task Status
                            </Link>
                        )}
                        {hasPermission("document.read") && (
                            <Link
                                to="/document"
                                onClick={closeSidebar}
                                className={`block mx-3 mt-2 py-2 text-white rounded-r-full transition-all duration-200 font-sans text-sm
                                ${isActive("/document")
                                        ? "bg-white/20 text-white shadow-md"
                                        : "text-white/80 hover:bg-white/10 hover:text-white"}`}
                            >
                                🗂️Document
                            </Link>
                        )}

                    </div>
                )}
                {/* Settings Toggle */}
                {hasPermission("permission.read") && user?.isSuperAdmin === true &&(
                    <div
                        onClick={() => setOpenSettings(!openSettings)}
                        className={`block mx-3 mt-2 py-2 text-white rounded-r-full transition-all duration-200 hover:bg-white/10 font-sans text-sm `}
                    >
                        ⚙Settings
                    </div>
                )}

                {/* SUB MENU */}
                {openSettings && (
                    <div className="ml-6 space-y-1">
                        {hasPermission("permission.read") && (
                            <Link
                                to="/permission"
                                onClick={closeSidebar}
                                className={`block mx-3 mt-2  py-2 text-white rounded-r-full transition-all duration-200 font-sans text-sm
                                ${isActive("/permission")
                                        ? "bg-white/20 text-white shadow-md"
                                        : "text-white/80 hover:bg-white/10 hover:text-white"}`}
                            >
                                🛡️Permission
                            </Link>
                        )}
                        {hasPermission("subcription.read") && (
                            <Link
                                to="/subcription"
                                onClick={closeSidebar}
                                className={`block mx-3 mt-2 mb-5 py-2 text-white rounded-r-full transition-all duration-200 font-sans text-sm
                                ${isActive("/subcription")
                                        ? "bg-white/20 text-white shadow-md"
                                        : "text-white/80 hover:bg-white/10 hover:text-white"}`}
                            >
                                💵Subcription
                            </Link>
                        )}
                    </div>
                )}

            </div>
        </aside >

    );

}
export default Sidebar;