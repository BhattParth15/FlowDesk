
import axios from "axios";
import { useEffect, useState } from "react";
import PageHeader from "../components/Pageheader";
import Showdata from "../components/ShowData";
import CommonTable from "../components/CommonTable";
import Pagination from "../components/Pagination";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../context/PermissionContext";
import socket from "../components/Socket";
import { useConfirmModal } from "../context/DeleteConfirmContext";
import { useCompany } from "../context/companyContext";
const API_URL = import.meta.env.VITE_API_URL;

function Staff() {
    const [staff, setStaff] = useState([]);
    const [showForm, setShowForm] = useState(false)
    const [roles, setRoles] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalpage, setTotalPage] = useState(1);
    const [confirmId, setConfirmId] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const { hasPermission } = usePermission();
    const { showConfirm } = useConfirmModal();
    const { selectedCompany } = useCompany();

    const navigate = useNavigate();
    useEffect(() => {
        if (hasPermission("staff.read")) {
            fetchStaff();
        }
        if (hasPermission("role.read")) {
            fetchRoles();
        }
    }, [page, limit, search, statusFilter, selectedCompany, hasPermission]);


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
            if (!selectedCompany) return;
            let url = `${API_URL}/role?page=1&limit=1000`;

            if (selectedCompany && selectedCompany._id !== "all") {
                url += `&companyId=${selectedCompany._id}`;
            }
            const res = await axios.get(url, { withCredentials: true });
            setRoles(res.data.roles);
        } catch (err) {
            console.log("Error:", err.res?.data || err.message);
        }
    }

    const fetchStaff = async () => {
        try {
            const token = localStorage.getItem("token");

            let url = `${API_URL}/staff?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}`;
            if (selectedCompany && selectedCompany._id !== "all") {
                url += `&companyId=${selectedCompany._id}`;
            }
            const res = await axios.get(url, { withCredentials: true });
            setStaff(res.data.staff || res.data);
            setTotalPage(res.data.totalPages);
            setPage(res.data.currentPage)
        } catch (err) {
            console.log("Error:", err.response?.data || err.message);
        }
    }
    const deleteStaff = async (id) => {
        try {
            await axios.delete(`${API_URL}/staff/${id}`, { withCredentials: true });
            // fetchStaff();
            // setConfirmId(null);
        } catch (error) {
            console.log(error || "Delete Staff Give Error ");
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
            header: "NAME",
            align: "left",
            width: "w-[180px]",
            accessor: "name"
        },
        {
            header: "EMAIL",
            align: "left",
            width: "w-[260px]",
            accessor: "email"
        },
        {
            header: "PHONE",
            align: "left",
            accessor: "phone"
        },
        {
            header: "ROLE",
            align: "left",
            render: (item) => (
                <code
                    className="value-code text-black"
                    onClick={() => navigate(`/role/edit/${item.role?._id}`)}>{item.role?.name}</code>
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
                    data={staff}
                    onEdit={(item) => navigate(`/staff/edit/${item._id}`, { state: item })}
                    onDelete={(item) =>
                        showConfirm({
                            id: item._id,
                            name: item.name,
                            onConfirm: () => deleteStaff(item._id),
                        })
                    }
                    actions
                    editPermission="staff.update"
                    deletePermission="staff.delete"
                />
                <Pagination page={page} totalPages={totalpage} setPages={setPage} />
            </div>

        </div>
    )
};

export default Staff;