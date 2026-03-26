
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/Pageheader.jsx";
import Showdata from "../components/ShowData.jsx";
import CommonTable from "../components/CommonTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { usePermission } from "../context/PermissionContext.jsx";
import socket from "../components/Socket.jsx";
import { useConfirmModal } from "../context/DeleteConfirmContext.jsx";
import ViewModal from "../View/ViewModuleData.jsx";
import { useCompany } from "../context/companyContext.jsx";
const API_URL = import.meta.env.VITE_API_URL;

function Project() {
    const [project, setProject] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalpage, setTotalPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [viewData, setViewData] = useState(null);
    const [showView, setShowView] = useState(false);
    const [activeAssigneePopup, setActiveAssigneePopup] = useState({ projectId: null, userId: null });
    const navigate = useNavigate();
    const { hasPermission } = usePermission();
    const { showConfirm } = useConfirmModal();
    const { selectedCompany } = useCompany();

    useEffect(() => {
        if (hasPermission("project.read")) {
            fetchProject();
        }

    }, [page, limit, search, statusFilter, selectedCompany, hasPermission]);


    useEffect(() => {
        // When a task is created
        socket.on("ProjectCreated", (newTask) => {
            setProject((prevTasks) => [newTask, ...prevTasks]);
        });

        // When a task is updated
        socket.on("ProjectUpdated", (updatedTask) => {
            setProject((prevTasks) =>
                prevTasks.map((t) => (t._id === updatedTask._id ? updatedTask : t))
            );
        });

        // When a task is deleted
        socket.on("ProjectDeleted", (deletedId) => {
            setProject((prevTasks) => prevTasks.filter((t) => t._id !== deletedId));
        });

        // Cleanup when component unmounts
        return () => {
            socket.off("ProjectCreated");
            socket.off("ProjectUpdated");
            socket.off("ProjectDeleted");
        };
    }, []);

    const fetchProject = async () => {
        try {
            //const res = await axios.get(`${API_URL}/project?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}`, { withCredentials: true });

            let url = `${API_URL}/project?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}`;
            if (selectedCompany && selectedCompany._id !== "all") {
                url += `&companyId=${selectedCompany._id}`;
            }
            const res = await axios.get(url, { withCredentials: true });

            setProject(res.data.projects);
            setTotalPage(res.data.totalPages);
            setPage(res.data.currentPage);
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };

    const Delete = async (id) => {
        try {
            await axios.delete(`${API_URL}/project/${id}`, { withCredentials: true });
            //fetchProject();
            // setConfirmId(null);
        } catch (err) {
            console.log(err.message);
        }
    };



    const column = [
        {
            header: "#",
            align: "left",
            width: "w-[40px]",
            render: (item, index) => (page - 1) * limit + index + 1
        },
        {
            header: "NAME",
            align: "left",
            width: "w-[180px]",
            accessor: "name"
        },
        // {
        //     header: "DESCRIPTION",
        //     accessor: "description"
        // },
        // {
        //     header: "ASSIGNEE",
        //     align:"left",
        //     width: "w-[350px]",
        //     render: (item) => (
        //         <span>
        //             {item.assignedUser?.map(u => u.name).join(", ") || "Unassigned"}
        //         </span>
        //     )
        // },
        {
            header: "ASSIGNEE",
            align: "left",

            render: (item, index) => {
                const users = item.assignedUser || [];
                if (!users.length) {
                    return (
                        <span className="text-gray-400 text-xs italic ml-2">Unassigned
                        </span>
                    );
                }
                const colorVariants = [
                    { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
                    { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" },
                    { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
                    { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" },
                    { bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-100" },
                    { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
                ];
                const openBelow = index < 2;
                return (
                    <div className="flex flex-wrap gap-2 py-1 ">
                        {users.map((u) => {
                            const initials = u.name
                                ?.split(" ")
                                .filter(Boolean)
                                .map((w) => w[0])
                                .join("")
                                .substring(0, 2)
                                .toUpperCase();
                            const style = colorVariants[u.name.charCodeAt(0) % colorVariants.length];
                            const isOpen =
                                activeAssigneePopup.projectId === item._id &&
                                activeAssigneePopup.userId === u._id;
                            return (
                                <div key={u._id} className="relative">
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveAssigneePopup(
                                                isOpen
                                                    ? { projectId: null, userId: null }
                                                    : { projectId: item._id, userId: u._id }
                                            );
                                        }}
                                        className={`flex items-center gap-2 px-2 py-1 rounded-md border shadow-sm cursor-pointer ${style.bg} ${style.border}`}
                                    >
                                        <div className={`w-5 h-5 flex items-center justify-center rounded-full bg-white border ${style.border} ${style.text} text-[9px] font-bold`}>
                                            {initials}
                                        </div>
                                        <span className={`text-[11px] font-semibold ${style.text}`}>
                                            {u.name}
                                        </span>
                                    </div>
                                    {isOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-500"
                                                onClick={() => setActiveAssigneePopup({ projectId: null, userId: null })}
                                            />
                                            <div className={`absolute left-0 z-[999] w-64 bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 
                                                            ${openBelow ? "top-full mt-3" : "bottom-full mb-3"}`}>
                                                <div className={`${style.bg} border-b ${style.border} p-3 flex items-center gap-3`}>
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white border ${style.border} ${style.text} font-bold`}>
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-800">
                                                            {u.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="p-3 text-[11px] space-y-2">
                                                    <div>
                                                        <p className="text-gray-400 text-[9px] uppercase font-bold">
                                                            Email
                                                        </p>
                                                        <p className="text-slate-700 truncate">
                                                            {u.email || "N/A"}
                                                        </p>
                                                    </div>
                                                    <div className="border-t pt-2">
                                                        <p className="text-gray-400 text-[9px] uppercase font-bold">
                                                            Phone
                                                        </p>
                                                        <p className="text-slate-700">
                                                            {u.phone || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`absolute left-4 w-3 h-3 bg-white rotate-45 border-slate-200
                                                                ${openBelow ? "-top-1.5 border-t border-l" : "-bottom-1.5 border-b border-r"}`}>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            }
        },
        {
            header: "STATUS",
            align: "center",
            width: "w-[100px]",
            render: (item) => (
                <div className="flex justify-center">
                    <span className={item.status === "Active" ? "badge-active" : "badge-inactive"}>
                        {item.status}
                    </span>
                </div>
            )
        }
    ];

    return (
        <div className="p-6">
            <PageHeader
                title="Project"
                onCreate={() => navigate("/project/create")}
                createPermission="project.create"
            />
            <div className="table-card">
                <Showdata
                    limit={limit}
                    setLimit={(newLimit) => { setLimit(newLimit); setPage(1); }}
                    search={search}
                    setSearch={setSearch}
                    setPage={setPage}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    statusOptions={["Active", "Inactive", "Deleted"]}
                />
                <CommonTable
                    columns={column}
                    data={project}
                    onEdit={(item) => navigate(`/project/edit/${item._id}`, { state: item })}
                    onView={(item) => { setViewData(item); setShowView(true); }}
                    onDelete={(item) =>
                        showConfirm({
                            id: item._id,
                            name: item.name,
                            onConfirm: () => Delete(item._id),
                        })
                    }
                    actions
                    viewPermission="project.read"
                    editPermission="project.update"
                    deletePermission="project.delete"
                />
                <ViewModal
                    open={showView}
                    data={viewData}
                    onClose={() => setShowView(false)}
                    fields={[
                        { label: "Project", key: "name" },
                        { label: "Description", key: "description", type: "text" },
                        { label: "Created", key: "createdAt", type: "date" }
                    ]}
                />
                <Pagination page={page} totalPages={totalpage} setPages={setPage} />
            </div>


        </div>
    );
}
export default Project;