
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this
import PageHeader from "../components/Pageheader.jsx";
import Showdata from "../components/ShowData.jsx";
import CommonTable from "../components/CommonTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { usePermission } from "../context/PermissionContext.jsx";
import socket from "../components/Socket.jsx";

function Permission() {
    const [permission, setPermission] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalpage, setTotalPage] = useState(1);
    const [confirmId, setConfirmId] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter]=useState("");
    const navigate = useNavigate();
    const {hasPermission}=usePermission();

    useEffect(() => {
        if(hasPermission("permission.read")){
            fetchPermission();
        }
    }, [page, limit,search,statusFilter, hasPermission]);


    useEffect(() => {
        // When a task is created
        socket.on("PermissionCreated", (newTask) => {
            setPermission((prevTasks) => [newTask, ...prevTasks]);
        });

        // When a task is updated
        socket.on("PermissionUpdated", (updatedTask) => {
            setPermission((prevTasks) =>
                prevTasks.map((t) => (t._id === updatedTask._id ? updatedTask : t))
            );
        });

        // When a task is deleted
        socket.on("PermissionDeleted", (deletedId) => {
            setPermission((prevTasks) => prevTasks.filter((t) => t._id !== deletedId));
        });

        // Cleanup when component unmounts
        return () => {
            socket.off("PermissionCreated");
            socket.off("PermissionUpdated");
            socket.off("PermissionDeleted");
        };
    }, []);

    const fetchPermission = async () => {
        try {
            const res = await axios.get(`http://localhost:9824/permission?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}`, { withCredentials: true });
            setPermission(res.data.permissions);
            setTotalPage(res.data.totalPages);
            setPage(res.data.currentPage);
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };

    const Delete = async (id) => {
        try {
            await axios.delete(`http://localhost:9824/permission/${id}`, { withCredentials: true });
            fetchPermission();
            setConfirmId(null);
        } catch (err) {
            console.log(err.message);
        }
    };

    const column = [
        { header: 
            "#", 
            render: (item, index) => (page - 1) * limit + index + 1 
        },
        { 
            header: "NAME", 
            accessor: "name" 
        },
        { 
        header: "VALUE", 
        render: (item) => (
            <code className="value-code">{item.value}</code> // Styled as code
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
                title="Permissions" 
                onCreate={() => navigate("/permission/create")}
                createPermission="permission.create" 
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
                    statusOptions={["Active","Inactive","Deleted"]} 
                />
                <CommonTable 
                    columns={column} 
                    data={permission} 
                    onEdit={(item) => navigate(`/permission/edit/${item._id}`, { state: item })} 
                    onDelete={setConfirmId} 
                    actions
                    editPermission="permission.update"
                    deletePermission="permission.delete"
                />
                <Pagination page={page} totalPages={totalpage} setPages={setPage} />
            </div>
            {/* Confirmation Modal */}
            {confirmId && (() => {
                const DeleteData = permission.find(t => t._id === confirmId);
                return (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl flex justify-between items-center border border-gray-200">

                            {/* Message: whitespace-nowrap keeps it on one line */}
                            <span className="text-gray-900 font-medium text-lg ">
                                {`Are you sure you want to delete Permission? - ${DeleteData?.name}`}
                            </span>

                            {/* Buttons */}
                            <div className="flex gap-4 ml-8">
                                <button
                                    className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
                                    onClick={() => Delete(confirmId)}
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
export default Permission;