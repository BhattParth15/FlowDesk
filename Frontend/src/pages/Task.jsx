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

function Task() {
    const [tasks, setTasks] = useState([]);
    const [staff, setStaff] = useState([]);
    const [statusList, setStatusList] = useState([]);
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalPage, setTotalPage] = useState(1);
    const [confirmTaskId, setConfirmTaskId] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingStatusId, setEditingStatusId] = useState(null);



    const navigate = useNavigate();
    const location = useLocation();
    const { hasPermission } = usePermission();


    useEffect(() => {
        if (hasPermission("task.read")) {
            fetchTasks();
        }

        if (hasPermission("staff.read")) {
            fetchStaff();
        }

        if (hasPermission("taskstatus.read")) {
            fetchStatus();
        }
    }, [page, limit, search, statusFilter, hasPermission]);

    useEffect(() => {
        // When a task is created
        socket.on("taskCreated", (newTask) => {
            setTasks((prevTasks) => [newTask, ...prevTasks]);
        });

        // When a task is updated
        socket.on("taskUpdated", (updatedTask) => {
            setTasks((prevTasks) =>
                prevTasks.map((t) => (t._id === updatedTask._id ? updatedTask : t))
            );
        });

        // When a task is deleted
        socket.on("taskDeleted", (deletedId) => {
            setTasks((prevTasks) => prevTasks.filter((t) => t._id !== deletedId));
        });

        // Cleanup when component unmounts
        return () => {
            socket.off("taskCreated");
            socket.off("taskUpdated");
            socket.off("taskDeleted");
        };
    }, []);


    const fetchTasks = async () => {
        try {
            const res = await axios.get(`http://localhost:9824/task?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}`, { withCredentials: true });
            console.log("TASK RESPONSE:", res.data);
            setTasks(res.data.tasks);
            setPage(res.data.currentPage);
            setTotalPage(res.data.totalPages)
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };

    const fetchStaff = async () => {
        try {
            const res = await axios.get(`http://localhost:9824/staff?page=1&limit=1000`, { withCredentials: true });
            setStaff(res.data.staff);
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };

    const fetchStatus = async () => {
        try {
            const res = await axios.get("http://localhost:9824/taskstatus?page=1&limit=1000", { withCredentials: true });
            console.log("STATUS RESPONSE:", res.data);
            const Data = res.data.taskStatus || res.data.tasks || res.data;
            setStatusList(Array.isArray(Data) ? Data : []);
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };

    const deleteTask = async (id) => {
        //if (!window.confirm("Are you sure you want to delete?")) return;
        try {
            await axios.delete(`http://localhost:9824/task/${id}`, { withCredentials: true });
            //fetchTasks(); ///Because Use Socket.io
            setConfirmTaskId(null); // Close confirmation box
        } catch (err) {
            console.log("Task Delete Error:", err.message)
        }
    }

    const handleAssigneeChange = async (taskId, userId) => {
        try {
            await axios.put(`http://localhost:9824/task/${taskId}`, { assignedTo: userId }, { withCredentials: true });
            //fetchTasks(); // refresh list
        } catch (err) {
            console.log(err);
        }
    };

    const handleStatusChange = async (taskId, statusId) => {
        try {
            await axios.put(`http://localhost:9824/task/${taskId}`, { taskStatus: statusId }, { withCredentials: true });
            //fetchTasks(); // refresh list
        } catch (err) {
            console.log(err);
        }
    };


    const column = [
        {
            header: "#",
            render: (item, index) => (page - 1) * limit + index + 1
        },
        {
            header: "TASK",
            accessor: "name"
        },
        {
            header: "DESCRIPTION",
            accessor: "description"
        },
        // {
        //     header: "IMAGES",
        //     render: (item) => (
        //         <div className="grid grid-cols-2 gap-1 w-fit">
        //             {item.image?.map((img, idx) => {
        //                 return (
        //                     <img
        //                         key={idx}
        //                         src={`https://res.cloudinary.com/djvwiudx2/image/upload/tasks/images/${img}`}
        //                         alt={"No Image"}
        //                         className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-60 transition-opacity"
        //                         onClick={() => window.open(`/view-image/${img}`, "_blank")}
        //                     />
        //                 )
        //             })}
        //         </div>
        //     )
        // },
        // {
        //     header: "VIDEO",
        //     render: (item) =>
        //         item.video ? (
        //             <div className="relative w-12 h-12 cursor-pointer border rounded bg-black"
        //                 //style={{ width: "100px", height: "80px" }}
        //                 onClick={() => window.open(`/view-video/${item.video}`, "_blank")}
        //             >
        //                 {/* The Overlay */}
        //                 <div className="absolute inset-0 z-10"></div>

        //                 <video className="w-full h-full object-cover rounded">
        //                     <source src={`https://res.cloudinary.com/djvwiudx2/video/upload/tasks/videos/${item.video}`} type="video/mp4" />
        //                 </video>
        //             </div>
        //         ) : (
        //             <span>-</span>
        //         )
        // },
        {
            header: "ASSIGNEE",
            render: (item) => {
                const isEditing = editingTaskId === item._id;
                return (
                    <div>
                        {isEditing ? (
                            <select
                                value={item.assignedTo?._id || ""}
                                onChange={(e) => {
                                    handleAssigneeChange(item._id, e.target.value);
                                    setEditingTaskId(null); // close dropdown
                                }}
                                onBlur={() => setEditingTaskId(null)} // close if clicked outside
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
                            <span
                                className="cursor-pointer hover:text-blue-600"
                                onClick={() => setEditingTaskId(item._id)}
                            >
                                {item.assignedTo?.name || "Unassigned"}
                            </span>
                        )}
                    </div>
                )
            }
        },

        {
            header: "TASK STATUS",
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
                                    handleStatusChange(item._id, e.target.value);
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
        {
            header: "CREATED AT",
            render: (item) => (
                <span>
                    {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "-"}
                </span>
            )
        }
    ];

    return (
        <div className="p-6">
            <PageHeader
                title="All Tasks"
                onCreate={() => navigate("/task/create")}
                createPermission="task.create"
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
                    statusOptions={statusList.map(s => ({
                        label: s.name,
                        value: s._id
                    }))}
                />
                <CommonTable
                    columns={column}
                    data={tasks}
                    onEdit={(item) => navigate(`/task/edit/${item._id}`, { state: item })}
                    onDelete={setConfirmTaskId}
                    actions
                    editPermission="task.update"
                    deletePermission="task.delete"
                />
                <Pagination page={page} totalPages={totalPage} setPages={setPage} />

            </div>
            {/* Confirmation Modal */}
            {confirmTaskId && (() => {
                const taskToDelete = tasks.find(t => t._id === confirmTaskId);
                return (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl flex justify-between items-center border border-gray-200">

                            {/* Message: whitespace-nowrap keeps it on one line */}
                            <span className="text-gray-900 font-medium text-lg ">
                                {`Are you sure you want to delete task?-${taskToDelete?.name}`}
                            </span>

                            {/* Buttons */}
                            <div className="flex gap-4 ml-8">
                                <button
                                    className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
                                    onClick={() => deleteTask(confirmTaskId)}
                                >
                                    Yes
                                </button>
                                <button
                                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 transition"
                                    onClick={() => setConfirmTaskId(null)}
                                >
                                    No
                                </button>
                            </div>

                        </div>
                    </div>
                )
            })()
            }
        </div>
    );
}

export default Task;
