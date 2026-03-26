import { useEffect, useState } from "react";
import axios from "axios";
import { useProject } from "../context/ProjectContext";
import { usePermission } from "../context/PermissionContext";

const API_URL = import.meta.env.VITE_API_URL;

function Team() {
    const { selectedProject } = useProject();
    const [team, setTeam] = useState([]);
    const { hasPermission } = usePermission();

    useEffect(() => {
        if (hasPermission("staff.read")) {
            fetchStaff();
        }
    }, [selectedProject, hasPermission]);

    const fetchStaff = async () => {
        try {
            let url = `${API_URL}`;
            if (selectedProject && selectedProject._id !== "all") {
                url += `/staff/project?page=1&limit=1000&projectId=${selectedProject._id}`;
            }else{
                url += `/staff?page=1&limit=1000`;
            }
            const res = await axios.get(url, { withCredentials: true });
            setTeam(res.data.staff);
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    }

    return (
        // Added bg-gray-50 for background contrast and responsive padding
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            {/* Improved Heading: Bolder text and tracking */}
            <h3 className=" font-['Geist'] text-2xl font-extrabold text-gray-800 mb-8 tracking-tight border-b pb-4">
                {selectedProject.name} <span className="font-medium text-slate-500">Members</span>
            </h3>

            {/* Grid: Added 2-column support for tablets and 4-column for large screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {team.map(member => (
                    <div
                        key={member._id}
                        // Added ring-1 for a crisp border and -translate-y on hover
                        className="group bg-white ring-1 ring-gray-200 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:ring-indigo-300"
                    >
                        {/* Name: Indigo color on group hover */}
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {member.name}
                        </h4>
                        <br></br>
                        {/* Contact Info: Smaller, lighter text for hierarchy */}
                        <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                <span className="opacity-70 text-xs">📧</span> {member.email}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                <span className="opacity-70 text-xs">📞</span> {member.phone}
                            </p>
                        </div>

                        {/* Status Badge: Using semi-transparent backgrounds for a "modern" feel */}
                        <span className={`inline-flex items-center mt-4 px-2.5 py-0.5 rounded-full text-xs font-semibold
                            ${member.status === "Active"
                                ? "bg-green-100 text-green-700 ring-1 ring-inset ring-green-600/20"
                                : "bg-red-100 text-red-700 ring-1 ring-inset ring-red-600/20"}
                        `}>
                            {/* Small pulse dot for Active status */}
                            {member.status === "Active" && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>}
                            {member.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Team;