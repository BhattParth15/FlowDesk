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
import { useConfirmModal } from "../context/DeleteConfirmContext.jsx";
import { useProject } from "../context/ProjectContext.jsx";
const API_URL = import.meta.env.VITE_API_URL;


function TaskStatus() {
    const [statusList, setStatusList] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalPage, setTotalPage] = useState(1);
    const [confirmId, setConfirmId] = useState(null);
    const [search, setSearch] = useState("");
    const [globalStatus, setGlobalStatus] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [error, setError] = useState("");
    const { hasPermission } = usePermission();
    const { showConfirm } = useConfirmModal();
    const { selectedProject } = useProject();



    const navigate = useNavigate();

    useEffect(() => {
        if (hasPermission("taskstatus.read")) {
            fetchStatus();
        }
    }, [page, limit, search, statusFilter, hasPermission, selectedProject]);

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
            let url = `${API_URL}/taskstatus?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}`;
            if (selectedProject && selectedProject._id !== "all") {
                url += `&projectId=${selectedProject._id}`;
            } else if (selectedProject?._id === "all" && selectedProject.projectIds?.length) {
                url += `&projectIds=${selectedProject.projectIds.join(",")}`;
            }
            //const res = await axios.get(`${API_URL}/taskstatus?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}`, { withCredentials: true });
            //const res = await axios.get(`${API_URL}/taskstatus?projectId=${selectedProject._id}&page=${page}&limit=${limit}&search=${search}&status=${statusFilter}`, { withCredentials: true })
            const res = await axios.get(url, { withCredentials: true });
            setStatusList(res.data.taskStatus);
            setTotalPage(res.data.totalPage);
            setPage(res.data.currentPage)
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };

    const deleteTaskStatus = async (id) => {
        try {

            await axios.delete(`${API_URL}/taskstatus/${id}`, { withCredentials: true });
            //fetchStatus();
            //setConfirmId(null);
        } catch (err) {
            console.log("Task Status Delete Error:", err.message)
        }

    }
    const column = [
        {
            header: "#",
            align: "left",
            width: "w-[40px]",
            render: (item, index) => (page - 1) * limit + index + 1
        },
        {
            header: "TASK STATUS",
            align: "left",

            render: (item) => (
                <span>
                    {item.name || "No Labels"}
                </span>
            )
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

    const handleCreateClick = () => {
        if (!selectedProject || selectedProject._id === "all") {
            setError("Please select a Project before creating a Task Status.");
            setTimeout(() => setError(""), 3000);
            return;
        }
        navigate("/taskstatus/create");
    };
    const handleEditClick = (item) => {
        if (item.projectId === null) {
            setError("This is a global Task Status, so you cannot edit this.");
            setTimeout(() => setError(""), 4000);
            return; // stop further edit
        }
        if (!selectedProject || selectedProject._id === "all") {
            setError(`Please select a Project before editing this Task Status.`);
            setTimeout(() => setError(""), 3000);
            return;
        }

        navigate(`/taskstatus/edit/${item._id}`, { state: item });
    }

    return (
        <div className="p-6">
            <PageHeader
                title="Task Status"
                onCreate={handleCreateClick}
                createPermission="taskstatus.create"
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
                    data={statusList}
                    //onEdit={(item) => navigate(`/taskstatus/edit/${item._id}`, { state: item })}
                    onEdit={(item) => handleEditClick(item)}
                    onDelete={(item) => {
                        if (item.projectId === null) {
                            setError("This is a global Task Status, so you cannot delete this.");
                            setTimeout(() => setError(""), 4000);
                            return;
                        }
                        showConfirm({
                            id: item._id,
                            name: item.name,
                            onConfirm: () => deleteTaskStatus(item._id),
                        })
                    }}
                    actions
                    editPermission="taskstatus.update"
                    deletePermission="taskstatus.delete"
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

export default TaskStatus;
