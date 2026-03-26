import axios from "axios";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import ReuseForm from "../components/reuseForm.jsx";
import PageHeader from "../components/Pageheader.jsx";
import Showdata from "../components/ShowData.jsx";
import CommonTable from "../components/CommonTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { usePermission } from "../context/PermissionContext";
import socket from "../components/Socket.jsx";
import { useConfirmModal } from "../context/DeleteConfirmContext.jsx";
import { useProject } from "../context/ProjectContext.jsx";
import ViewModal from "../View/ViewModuleData.jsx";
const API_URL = import.meta.env.VITE_API_URL;

function TaskIssue() {
    const [tasks, setTasks] = useState([]);
    const [staff, setStaff] = useState([]);
    const [statusList, setStatusList] = useState([]);
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalPage, setTotalPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [assigneeFilter, setAssigneeFilter] = useState("");
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingStatusId, setEditingStatusId] = useState(null);
    const [error, setError] = useState("");
    const [viewData, setViewData] = useState(null);
    const [showView, setShowView] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { hasPermission } = usePermission();
    const { showConfirm } = useConfirmModal();
    const { selectedProject } = useProject();

    const mode = location.pathname.includes("issue") ? "issue" : "task";

    useEffect(() => {
        setPage(1);
    }, [selectedProject, mode]);

    useEffect(() => {
        if (hasPermission(`${mode}.read`)) {
            fetchTasks();
        }

        if (hasPermission("staff.read")) {
            fetchStaff();
        }

        if (hasPermission("taskstatus.read")) {
            fetchStatus();
        }
    }, [page, limit, search, statusFilter, assigneeFilter, hasPermission, selectedProject, mode]);

    useEffect(() => {
        // When a task is created
        socket.on("taskCreated", (newTask) => {
            if (!newTask.type || newTask.type === mode) {
                setTasks((prevTasks) => [newTask, ...prevTasks]);
            }
        });

        // When a task is updated
        socket.on("taskUpdated", (updatedTask) => {
            if (!updatedTask.type || updatedTask.type === mode) {
                setTasks((prevTasks) =>
                    prevTasks.map((t) => (t._id === updatedTask._id ? updatedTask : t))
                );
            }
        });

        // When a task is deleted
        socket.on("taskDeleted", (taskId) => {
            setTasks((prevTasks) =>
                prevTasks.filter((t) => t._id !== taskId)
            );
        });

        // Cleanup when component unmounts
        return () => {
            socket.off("taskCreated");
            socket.off("taskUpdated");
            socket.off("taskDeleted");
        };
    }, [mode]);


    const fetchTasks = async () => {
        try {
            let url = `${API_URL}`;

            if (selectedProject && selectedProject._id !== "all") {
                url += `/task?projectId=${selectedProject._id}&page=${page}&limit=${limit}&search=${search}&status=${statusFilter}&assignedTo=${assigneeFilter}&type=${mode}`;
            } else if (selectedProject?._id === "all" && selectedProject.projectIds?.length) {
                url += `/task?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}&assignedTo=${assigneeFilter}&type=${mode}&projectIds=${selectedProject.projectIds.join(",")}`;
            }
            const res = await axios.get(url, { withCredentials: true });
            //const res = await axios.get(`${API_URL}/task?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}`, { withCredentials: true });
            //const res = await axios.get(`${API_URL}/task?projectId=${selectedProject._id}`, { withCredentials: true });
            setTasks(res.data.tasks);
            setPage(res.data.currentPage);
            setTotalPage(res.data.totalPages)
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };

    const fetchStaff = async () => {
        try {
            let url = `${API_URL}`;

            if (selectedProject && selectedProject._id !== "all") {
                url += `/staff/project?page=1&limit=1000&projectId=${selectedProject._id}`;
            } else {
                url += `/staff?page=1&limit=1000`;
            }
            const res = await axios.get(url, { withCredentials: true });
            //const res = await axios.get(`${API_URL}/staff/project?projectId=${selectedProject._id}`, { withCredentials: true })
            // const res = await axios.get(`${API_URL}/project/${selectedProject._id}/staff`, { withCredentials: true });
            //const res = await axios.get(`${API_URL}/staff?page=1&limit=1000`, { withCredentials: true });
            setStaff(res.data.staff);
            //setAssigneeFilter(res.data.staff);
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };

    const fetchStatus = async () => {
        try {
            let url = `${API_URL}/taskstatus?page=1&limit=1000`;

            if (selectedProject && selectedProject._id !== "all") {
                url += `&projectId=${selectedProject._id}`;
            }
            const res = await axios.get(url, { withCredentials: true });
            //const res = await axios.get(`${API_URL}/taskstatus?page=1&limit=1000`, { withCredentials: true });
            // console.log("STATUS RESPONSE:", res.data);
            const Data = res.data.taskStatus || res.data.tasks || res.data;
            setStatusList(Array.isArray(Data) ? Data : []);
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };

    const deleteTask = async (id) => {
        //if (!window.confirm("Are you sure you want to delete?")) return;
        try {
            await axios.delete(`${API_URL}/task/${id}`, { withCredentials: true });
            //fetchTasks(); ///Because Use Socket.io
            //setConfirmTaskId(null); // Close confirmation box
        } catch (err) {
            console.log("Data Delete Error:", err.message)
        }
    }

    const handleAssigneeChange = async (task, userId) => {
        try {
            await axios.put(`${API_URL}/task/${task._id}?type=${mode}`,
                {
                    name: task.name,
                    description: task.description,
                    taskStatus: task.taskStatus?._id || task.taskStatus,
                    assignedTo: userId,
                    projectId: task.projectId?._id || task.projectId,
                    priority: task.priority
                }, { withCredentials: true });
            //fetchTasks(); // refresh list
        } catch (err) {
            console.log(err);
        }
    };

    const handleStatusChange = async (task, statusId) => {
        try {
            await axios.put(`${API_URL}/task/${task._id}?type=${mode}`,
                {
                    name: task.name,
                    description: task.description,
                    taskStatus: task.taskStatus?._id || task.taskStatus,
                    assignedTo: task.assignedTo?._id || task.assignedTo,
                    projectId: task.projectId?._id || task.projectId,
                    priority: task.priority,
                    taskStatus: statusId
                }, { withCredentials: true });
            //fetchTasks(); // refresh list
        } catch (err) {
            console.log(err);
        }
    };

    const handleCreateClick = () => {
        if (!selectedProject || selectedProject._id === "all") {
            setError(`Please select a Project before creating a ${mode}.`);
            setTimeout(() => setError(""), 3000);
            return;
        }
        if (mode === "task") {
            navigate("/task/create");
        }
        if (mode == "issue") {
            navigate("/issue/create");
        }
    };
    const handleBulkUpload = () => {
        if (!selectedProject || selectedProject._id === "all") {
            setError(`Please select a Project before creating a ${mode}.`);
            setTimeout(() => setError(""), 3000);
            return;
        }
        navigate(`/bulk/upload?type=${mode === "issue" ? "issue" : "task"}`);
    };
    const handleEditClick = (item) => {
        if (!selectedProject || selectedProject._id === "all") {
            setError(`Please select a Project before editing this ${mode}.`);
            setTimeout(() => setError(""), 3000);
            return;
        }

        // ✅ otherwise allow edit
        navigate(`/${mode}/edit/${item._id}`, { state: item });

    }

    const column = [
        {
            header: "#",
            align: "center",
            width: "w-[40px]",
            render: (item, index) => (page - 1) * limit + index + 1
        },
        {
            header: mode === "issue" ? "ISSUE" : "TASK",
            align: "left",
            width: "w-[200px]",
            accessor: "name"
        },
        // {
        //     header: "DESCRIPTION",
        //     accessor: "description"
        // },
        // {
        //     header: "ASSIGNEE",
        //     align:"left",
        //     render: (item) => {
        //         const isEditing = editingTaskId === item._id;
        //         return (
        //             <div>
        //                 {isEditing ? (
        //                     <select
        //                         value={item.assignedTo?._id || ""}
        //                         onChange={(e) => {
        //                             handleAssigneeChange(item, e.target.value);
        //                             setEditingTaskId(null); // close dropdown
        //                         }}
        //                         onBlur={() => setEditingTaskId(null)} // close if clicked outside
        //                         autoFocus
        //                         className="border rounded px-2 py-1"
        //                     >
        //                         <option value="">Unassigned</option>
        //                         {staff.map((user) => (
        //                             <option key={user._id} value={user._id}>
        //                                 {user.name}
        //                             </option>
        //                         ))}
        //                     </select>
        //                 ) : (
        //                     <span
        //                         className="cursor-pointer hover:text-blue-600"
        //                         onClick={() => setEditingTaskId(item._id)}
        //                     >
        //                         {item.assignedTo?.name || "Unassigned"}
        //                     </span>
        //                 )}
        //             </div>
        //         )
        //     }
        // },
        {
            header: "ASSIGNEE",
            align: "left",
            width: "w-[250px]",
            render: (item) => {
                const isEditing = editingTaskId === item._id;
                const name = item.assignedTo?.name || "Unassigned";

                const initials = name !== "Unassigned"
                    ? name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "";

                const avatarColors = [
                    "bg-red-300 text-red-700",
                    "bg-green-300 text-green-700",
                    "bg-blue-300 text-blue-700",
                    "bg-purple-300 text-purple-700",
                    "bg-pink-300 text-pink-700",
                    "bg-indigo-300 text-indigo-700"
                ];
                const avatarColor = avatarColors[name.charCodeAt(0) % avatarColors.length];
                return (
                    <div>
                        {isEditing ? (
                            <select
                                value={item.assignedTo?._id || ""}
                                onChange={(e) => {
                                    handleAssigneeChange(item, e.target.value);
                                    setEditingTaskId(null);
                                }}
                                onBlur={() => setEditingTaskId(null)}
                                autoFocus
                                className="border rounded px-2 py-1"
                            >
                                <option value="">Unassigned</option>
                                {staff.map((user) => (
                                    <option key={user._id} value={user._id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div
                                className="flex gap-2 rounded-full"
                                onClick={() => setEditingTaskId(item._id)}
                            >
                                {name !== "Unassigned" && (
                                    <div
                                        className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold ${avatarColor}`}
                                    >
                                        {initials}
                                    </div>
                                )}
                                <span className=" text-slate-700 hover:text-blue-500">{name}</span>
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            header: mode === "issue" ? "ISSUE STATUS" : "TASK STATUS",
            align: "left",

            render: (item) => {
                const isEditing = editingStatusId === item._id;
                const status = item.taskStatus?.name || "-";

                const statusColors = {
                    Completed: "bg-green-300 text-green-800",
                    Inprogress: "bg-yellow-200 text-yellow-800",
                    Pending: "bg-blue-200 text-blue-800",
                    Delayed: "bg-red-200 text-red-800",
                    default: "bg-orange-200 text-orange-800",
                };

                const colorClass = statusColors[status] || statusColors.default;

                return (
                    <div>
                        {isEditing ? (
                            <select
                                value={item.taskStatus?._id || ""}
                                onChange={(e) => {
                                    handleStatusChange(item, e.target.value);
                                    setEditingStatusId(null);
                                }}
                                onBlur={() => setEditingStatusId(null)}
                                autoFocus
                                className="border rounded px-2 py-1 text-sm"
                            >
                                <option value="">Select Status</option>
                                {statusList.map((status) => (
                                    <option key={status._id} value={status._id}>
                                        {status.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <span
                                className={`px-2 py-1 rounded-full text-sm font-semibold cursor-pointer ${colorClass}`}
                                onClick={() => setEditingStatusId(item._id)}
                            >
                                {status}
                            </span>
                        )}
                    </div>
                );
            }
        },
        // {
        //     header: "CREATED AT",
        //     render: (item) => (
        //         <span>
        //             {item.createdAt
        //                 ? new Date(item.createdAt).toLocaleDateString()
        //                 : "-"}
        //         </span>
        //     )
        // },
        ...(mode === "issue"
            ? [{
                header: "PRIORITY",
                align: "center",
                width: "w-[100px]",
                render: (item) => (
                    <div className="flex justify-center">
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold
            ${item.priority === "High"
                                    ? "bg-red-200 text-red-800"
                                    : item.priority === "Medium"
                                        ? "bg-yellow-200 text-yellow-800"
                                        : "bg-green-200 text-green-800"
                                }`}
                        >
                            {item.priority || "-"}
                        </span>
                    </div>
                )
            }]
            : [])

    ];

    return (
        <div className="p-6">
            <PageHeader
                title={mode === "issue" ? "All Issues" : "All Tasks"}
                type={mode === "issue" ? "issue" : "task"}
                onCreate={handleCreateClick}
                onBulkUpload={handleBulkUpload}
                createPermission={mode === "issue" ? "issue.create" : "task.create"}
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
                    assigneeFilter={assigneeFilter}
                    setAssigneeFilter={setAssigneeFilter}
                    type={mode === "issue" ? "issue" : "task"}
                    assigneeOptions={staff.map(user => ({
                        label: user.name,
                        value: user._id
                    }))}
                    statusOptions={statusList.map(s => ({
                        label: s.name,
                        value: s._id
                    }))}
                />
                <CommonTable
                    columns={column}
                    data={tasks}
                    //onEdit={(item) => navigate(`/${mode}/edit/${item._id}`, { state: item })}
                    onEdit={(item) => handleEditClick(item)}
                    onView={(item) => { setViewData(item); setShowView(true); }}
                    onDelete={(item) =>
                        showConfirm({
                            id: item._id,
                            name: item.name,
                            onConfirm: () => deleteTask(item._id),
                        })
                    }
                    actions
                    viewPermission={mode === "issue" ? "issue.read" : "task.read"}
                    editPermission={mode === "issue" ? "issue.update" : "task.update"}
                    deletePermission={mode === "issue" ? "issue.delete" : "task.delete"}
                />
                <ViewModal
                    open={showView}
                    data={viewData}
                    onClose={() => setShowView(false)}
                    fields={[
                        { label: mode === "issue" ? "Issue" : "Task", key: "name" },
                        { label: "Description", key: "description", type: "text" },
                        { label: "Images", key: "image", type: "image" },
                        { label: "Video", key: "video", type: "video" },
                        { label: "Created", key: "createdAt", type: "date" }
                    ]}
                />
                <Pagination page={page} totalPages={totalPage} setPages={setPage} />

            </div>
            {error && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-6 py-3 rounded-lg shadow-lg z-[500] border border-red-200 min-w-[300px] text-center">
                    {error}
                </div>
            )}
        </div>
    );
}

export default TaskIssue;
