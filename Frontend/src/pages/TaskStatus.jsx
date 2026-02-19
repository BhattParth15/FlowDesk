import axios from "axios";
import { useEffect, useState } from "react";
import ReuseForm from "../components/reuseForm.jsx";
import PageHeader from "../components/Pageheader.jsx";
import Showdata from "../components/ShowData.jsx";
import CommonTable from "../components/CommonTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../context/PermissionContext.jsx";
import socket from "../components/Socket.jsx";

function TaskStatus() {
    const [statusList, setStatusList] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalPage, setTotalPage] = useState(1);
    const [confirmId, setConfirmId] = useState(null);
    const [search,setSearch]=useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const { hasPermission } = usePermission();


    const navigate = useNavigate();

    useEffect(() => {
        if (hasPermission("taskstatus.read")) {
            fetchStatus();
        }
    }, [page, limit,search,statusFilter, hasPermission]);

    useEffect(() => {
        // When a task is created
        socket.on("taskStatusCreated", (newTask) => {
            setStatusList((prevTasks) => [newTask, ...prevTasks]);
        });

        // When a task is updated
        socket.on("taskStatusUpdated", (updatedTask) => {
            setStatusList((prevTasks) =>
                prevTasks.map((t) => (t._id === updatedTask._id ? updatedTask : t))
            );
        });

        // When a task is deleted
        socket.on("taskStatusDeleted", (deletedId) => {
            setStatusList((prevTasks) => prevTasks.filter((t) => t._id !== deletedId));
        });

        // Cleanup when component unmounts
        return () => {
            socket.off("taskStatusCreated");
            socket.off("taskStatusUpdated");
            socket.off("taskStatusDeleted");
        };
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await axios.get(`http://localhost:9824/taskstatus?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}`, { withCredentials: true });
            
            setStatusList(res.data.taskStatus);
            setTotalPage(res.data.totalPage);
            setPage(res.data.currentPage)
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };
   
    const deleteTaskStatus = async (id) => {
        try {
            await axios.delete(`http://localhost:9824/taskstatus/${id}`, { withCredentials: true });
            //fetchStatus();
            setConfirmId(null);
        } catch (err) {
            console.log("Task Status Delete Error:", err.message)
        }

    }
    const column = [
        {
            header: "#",
            render: (item, index) => (page - 1) * limit + index + 1
        },
        {
            header: "TASK STATUS",
            render: (item) => (
                <span>
                    {item.name || "No Labels"}
                </span>
            )
        },
        {
            header: "STATUS",
            render: (item) => (
                <span className={item.status === "Active" ? "badge-active" : "badge-inactive"}>
                    {item.status}
                </span>
            )
        }

    ];

    return (
        <div className="p-6">
            <PageHeader
                title="Task Status"
                onCreate={() => navigate("/taskstatus/create")}
                createPermission="taskstatus.create"
            />
            <div className="table-card">
                <Showdata 
                    limit={limit} 
                    setLimit={(newLimit) =>{setLimit(newLimit);setPage(1);}}
                    search={search}
                    setSearch={setSearch}
                    setPage={setPage}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    statusOptions={["Active", "Inactive", "Deleted"]}
                />
                <CommonTable
                    columns={column}
                    data={statusList}
                    onEdit={(item) => navigate(`/taskstatus/edit/${item._id}`, { state: item })}
                    onDelete={setConfirmId}
                    actions
                    editPermission="taskstatus.update"
                    deletePermission="taskstatus.delete"
                />
                <Pagination page={page} totalPages={totalPage} setPages={setPage} />
            </div>
            {/* Confirmation Modal */}
            {confirmId && (() => {
                const DeleteData = statusList.find(t => t._id === confirmId);
                return (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl flex justify-between items-center border border-gray-200">

                            {/* Message: whitespace-nowrap keeps it on one line */}
                            <span className="text-gray-900 font-medium text-lg ">
                                {`Are you sure you want to delete TaskStatus? - ${DeleteData?.name}`}
                            </span>

                            {/* Buttons */}
                            <div className="flex gap-4 ml-8">
                                <button
                                    className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
                                    onClick={() => deleteTaskStatus(confirmId)}
                                >
                                    Yes
                                </button>
                                <button
                                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 transition"
                                    onClick={() => setConfirmId(null)}
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

export default TaskStatus;
