import { Link } from "react-router-dom";
import { useState } from "react";
import { usePermission } from "../context/PermissionContext";

function Sidebar() {
    const [openSettings, setOpenSettings] = useState(false);
    const { hasPermission } = usePermission();

    return (
        <aside className="w-60 h-screen bg-[#f4f5f7] border-accent flex flex-col">
            <div>
                {hasPermission("staff.read") && (
                    <Link to="/staff" className="block px-3 py-2 rounded hover-accent">
                        Manage Staff
                    </Link>
                )}

                {hasPermission("role.read") && (
                    <Link to="/role" className="block px-3 py-2 rounded hover-accent">
                        Manage Role
                    </Link>
                )}
                {hasPermission("task.read") && (
                    <Link to="/task" className="block px-3 py-2 rounded hover-accent">
                        Manage Task
                    </Link>
                )}

                <div
                    onClick={() => setOpenSettings(!openSettings)}
                    className="block px-3 py-2 rounded hover-accent cursor-pointer">
                    Settings
                </div>

                {/* SUB MENU */}
                {openSettings && (
                    <div className="ml-4 mt-1 space-y-1">
                        {hasPermission("taskstatus.read") && (
                            <Link
                                to="/taskstatus"
                                className="block px-3 py-2 rounded hover-accent">
                                TaskStatus
                            </Link>
                        )}

                        {hasPermission("permission.read") && (
                            <Link
                                to="/permission"
                                className="block px-3 py-2 rounded hover-accent">
                                Permission
                            </Link>
                        )}

                    </div>
                )}

            </div>
        </aside>
    );
}
export default Sidebar;