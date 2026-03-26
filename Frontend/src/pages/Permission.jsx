
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this
import PageHeader from "../components/Pageheader.jsx";
import Showdata from "../components/ShowData.jsx";
import CommonTable from "../components/CommonTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { usePermission } from "../context/PermissionContext.jsx";
import socket from "../components/Socket.jsx";
import { useConfirmModal } from "../context/DeleteConfirmContext.jsx";
import { useCompany } from "../context/companyContext.jsx";
const API_URL = import.meta.env.VITE_API_URL;

function Permission() {
    const [permission, setPermission] = useState([]);
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
        if (hasPermission("permission.read")) {
            fetchPermission();
        }
    }, [page, limit, search, statusFilter,selectedCompany,hasPermission]);


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
            //const res = await axios.get(`${API_URL}/permission?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}`, { withCredentials: true });
            let url = `${API_URL}/permission?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}`;
            if (selectedCompany && selectedCompany._id !== "all") {
                url += `&companyId=${selectedCompany._id}`;
            }
            const res = await axios.get(url, { withCredentials: true });
            setPermission(res.data.permissions);
            setTotalPage(res.data.totalPages);
            setPage(res.data.currentPage);
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };

    const Delete = async (id) => {
        try {
            await axios.delete(`${API_URL}/permission/${id}`, { withCredentials: true });
            //fetchPermission();

        } catch (err) {
            console.log(err.message);
        }
    };

    const column = [
        {
            header: "#",
            align: "center",
            width: "w-[40px]",
            render: (item, index) => (page - 1) * limit + index + 1
        },
        {
            header: "NAME",
            align:"left",
            width: "w-[250px]",
            accessor: "name"
        },
        {
            header: "VALUE",
            align:"left",
            render: (item) => (
                <code className="value-code">{item.value}</code> // Styled as code
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
                    data={permission}
                    onEdit={(item) => navigate(`/permission/edit/${item._id}`, { state: item })}
                    onDelete={(item) =>
                        showConfirm({
                            id: item._id,
                            name: item.name,
                            onConfirm: () => Delete(item._id),
                        })
                    }
                    actions
                    editPermission="permission.update"
                    deletePermission="permission.delete"
                />
                <Pagination page={page} totalPages={totalpage} setPages={setPage} />
            </div>
        </div>
    );
}
export default Permission;