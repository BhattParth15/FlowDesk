
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CommonTable from "../components/CommonTable.jsx";
import PageHeader from "../components/Pageheader.jsx";
import Showdata from "../components/ShowData.jsx";
import Pagination from "../components/Pagination.jsx";
import { usePermission } from "../context/PermissionContext.jsx";
import socket from "../components/Socket.jsx";
import { useConfirmModal } from "../context/DeleteConfirmContext.jsx";
import { useCompany } from "../context/companyContext.jsx";
const API_URL = import.meta.env.VITE_API_URL;

function Role() {
    const [roles, setRoles] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalpage, setTotalPage] = useState(1);
    const [confirmId, setConfirmId] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const navigate = useNavigate();
    const { hasPermission } = usePermission();
    const { showConfirm } = useConfirmModal();
    const { selectedCompany } = useCompany();

    useEffect(() => {
        if (hasPermission("role.read")) {
            fetchRole();
        }
    }, [page, limit, search, statusFilter,selectedCompany, hasPermission]);

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
        let url = `${API_URL}/role?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}`;
        if (selectedCompany && selectedCompany._id !== "all") {
            url += `&companyId=${selectedCompany._id}`;
        }
        const res = await axios.get(url, { withCredentials: true });
        setRoles(res.data.roles);
        setTotalPage(res.data.totalPages);
    };

    const deleteRole = async (id) => {
        await axios.delete(`${API_URL}/role/${id}`, { withCredentials: true });
        //setConfirmId(null);
        //fetchRole();
    }

    const columns = [
        {
            header: "#",
            align: "left",
            width: "w-[40px]",
            render: (item, index) => <div className="flex justify-center">
                {(page - 1) * limit + index + 1}
            </div>
        },
        {
            header: "ROLE",
            align: "left",
            accessor: "name"
        },
        {
            header: "STATUS",
            width: "w-[100px]",
            align: "center",
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
                title="Role"
                onCreate={() => navigate("/role/create")}
                createPermission="role.create"
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
                    columns={columns}
                    data={roles}
                    onEdit={(item) => navigate(`/role/edit/${item._id}`, { state: item })}
                    onDelete={(item) =>
                        showConfirm({
                            id: item._id,
                            name: item.name,
                            onConfirm: () => deleteRole(item._id),
                        })
                    }
                    actions
                    editPermission="role.update"
                    deletePermission="role.delete"
                />
                <Pagination page={page} totalPages={totalpage} setPages={setPage} />
            </div>
        </div>
    );
}
export default Role;