
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import CommonTable from "../components/CommonTable.jsx";
import PageHeader from "../components/Pageheader.jsx";
import Showdata from "../components/ShowData.jsx";     
import Pagination from "../components/Pagination.jsx"; 
import { usePermission } from "../context/PermissionContext.jsx";
import socket from "../components/Socket.jsx";

function Role() {
    const [roles, setRoles] = useState([]);
    const [page, setPage] = useState(1);               
    const [limit, setLimit] = useState(5);            
    const [totalpage, setTotalPage] = useState(1);
    const [confirmId, setConfirmId] = useState(null);
    const [search,setSearch]=useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const navigate = useNavigate();
    const {hasPermission}=usePermission();

    useEffect(() => {
        if(hasPermission("role.read")){
            fetchRole();
        }
    }, [page,limit,search,statusFilter,hasPermission]);

    useEffect(() => {
        // When a task is created
        socket.on("roleCreated", (newTask) => {
            setRoles((prevTasks) => [newTask, ...prevTasks]);
        });

        // When a task is updated
        socket.on("roleUpdated", (updatedTask) => {
            setRoles((prevTasks) =>
                prevTasks.map((t) => (t._id === updatedTask._id ? updatedTask : t))
            );
        });

        // When a task is deleted
        socket.on("roleDeleted", (deletedId) => {
            setRoles((prevTasks) => prevTasks.filter((t) => t._id !== deletedId));
        });

        // Cleanup when component unmounts
        return () => {
            socket.off("roleCreated");
            socket.off("roleUpdated");
            socket.off("roleDeleted");
        };
    }, []);

    const fetchRole = async () => {
        const res = await axios.get(`http://localhost:9824/role?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}`, { withCredentials: true });
        setRoles(res.data.roles);
        setTotalPage(res.data.totalPages)
    };

    const deleteRole = async (id) => {
        await axios.delete(`http://localhost:9824/role/${id}`, { withCredentials: true });
        setConfirmId(null);
        fetchRole();   
    }

    const columns = [
        { 
            header: "#", 
            render: (item, index) => index + 1 
        },
        { 
            header: "ROLE", 
            accessor: "name" },
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
                title="Role" 
                onCreate={() => navigate("/role/create")}
                createPermission="role.create"
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
                    columns={columns} 
                    data={roles} 
                    onEdit={(item) => navigate(`/role/edit/${item._id}`, { state: item })} 
                    onDelete={setConfirmId}
                    actions
                    editPermission="role.update"
                    deletePermission="role.delete"
                />
                <Pagination page={page} totalPages={totalpage} setPages={setPage} />
            </div>
            {/* Confirmation Modal */}
            {confirmId && (() => {
                const DeleteData = roles.find(t => t._id === confirmId);
                return (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl flex justify-between items-center border border-gray-200">

                            {/* Message: whitespace-nowrap keeps it on one line */}
                            <span className="text-gray-900 font-medium text-lg ">
                                {`Are you sure you want to delete Role? - ${DeleteData?.name}`}
                            </span>

                            {/* Buttons */}
                            <div className="flex gap-4 ml-8">
                                <button
                                    className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
                                    onClick={() => deleteRole(confirmId)}
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
export default Role;