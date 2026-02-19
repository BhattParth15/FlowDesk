
import axios from "axios";
import { useEffect, useState } from "react";
import PageHeader from "../components/Pageheader";
import Showdata from "../components/ShowData";
import CommonTable from "../components/CommonTable";
import Pagination from "../components/Pagination";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../context/PermissionContext";
import socket from "../components/Socket";

function Staff() {
    const [staff, setStaff] = useState([]);
    const [showForm, setShowForm] = useState(false)
    const [roles, setRoles] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalpage, setTotalPage] = useState(1);
    const [confirmId, setConfirmId] = useState(null);
    const [search, setSearch]=useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const { hasPermission } = usePermission();

    const navigate = useNavigate();
    useEffect(() => {
        if (hasPermission("staff.read")) {
            fetchStaff();
        }
        if (hasPermission("role.read")) {

            fetchRoles();
        }
    }, [page, limit,search,statusFilter, hasPermission]);


    useEffect(() => {
        // When a task is created
        socket.on("staffCreated", (newTask) => {
            setStaff((prevTasks) => [newTask, ...prevTasks]);
        });

        // When a task is updated
        socket.on("staffUpdated", (updatedTask) => {
            setStaff((prevTasks) =>
                prevTasks.map((t) => (t._id === updatedTask._id ? updatedTask : t))
            );
        });

        // When a task is deleted
        socket.on("staffDeleted", (deletedId) => {
            setStaff((prevTasks) => prevTasks.filter((t) => t._id !== deletedId));
        });

        // Cleanup when component unmounts
        return () => {
            socket.off("staffCreated");
            socket.off("staffUpdated");
            socket.off("staffDeleted");
        };
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await axios.get("http://localhost:9824/role?page=1&limit=1000", { withCredentials: true });

            setRoles(res.data.role);
        } catch (err) {
            console.log("Error:", err.res?.data || err.message);
        }
    }

    const fetchStaff = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(`http://localhost:9824/staff?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}`, {
                withCredentials: true //Because we used cookie 
            });

            console.log("Response:", res.data);
            setStaff(res.data.staff || res.data);
            setTotalPage(res.data.totalPages);
            setPage(res.data.currentPage)
        } catch (err) {
            console.log("Error:", err.response?.data || err.message);
        }
    }
    const deleteStaff= async(id)=>{
        try{
            await axios.delete(`http://localhost:9824/staff/${id}`,{withCredentials:true});
            fetchStaff();
            setConfirmId(null);
        }catch(error){
            console.log(error || "Delete Staff Give Error ");
        }
    }
    const column=[
        {
            header: "#",
            render: (item, index) => (page - 1) * limit + index + 1
        },
        {
            header: "NAME",
            accessor: "name"
        },
        {
            header:"EMAIL",
            accessor:"email"
        },
        {
            header:"PHONE",
            accessor:"phone"
        },
        {
            header: "ROLE",
            render: (item) => (
                <code 
                    className="value-code" 
                    onClick={() => navigate(`/role/edit/${item.role?._id}`)}>{item.role?.name}</code> 
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
    ]
    return (
        <div className="p-6">
            <PageHeader
                title="Staff"
                onCreate={() => navigate("/staff/create")}
                createPermission="staff.create"
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
                    data={staff}
                    onEdit={(item) => navigate(`/staff/edit/${item._id}`, { state: item })}
                    onDelete={setConfirmId}
                    actions
                    editPermission="staff.update"
                    deletePermission="staff.delete"
                />
                <Pagination page={page} totalPages={totalpage} setPages={setPage} />
            </div>
            {/* Confirmation Modal */}
            {confirmId && (() => {
                const DeleteData = staff.find(t => t._id === confirmId);
                return (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl flex justify-between items-center border border-gray-200">

                            {/* Message: whitespace-nowrap keeps it on one line */}
                            <span className="text-gray-900 font-medium text-lg ">
                                {`Are you sure you want to delete staff name?-${DeleteData?.name}`}
                            </span>

                            {/* Buttons */}
                            <div className="flex gap-4 ml-8">
                                <button
                                    className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
                                    onClick={() => deleteStaff(confirmId)}
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
    )
};

export default Staff;