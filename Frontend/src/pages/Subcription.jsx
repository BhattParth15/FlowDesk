
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this
import PageHeader from "../components/Pageheader.jsx";
import Showdata from "../components/ShowData.jsx";
import CommonTable from "../components/CommonTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { usePermission } from "../context/PermissionContext.jsx";
//import socket from "../components/Socket.jsx";
import { useConfirmModal } from "../context/DeleteConfirmContext.jsx";
const API_URL = import.meta.env.VITE_API_URL;

function Subcription() {
    const [subcription, setSubcription] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalpage, setTotalPage] = useState(1);
    const [confirmId, setConfirmId] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const navigate = useNavigate();
    const { hasPermission } = usePermission();
    const { showConfirm } = useConfirmModal();

    useEffect(() => {
        if (hasPermission("subcription.read")) {
            fetchSubcription();
        }
    }, [page, limit, search, statusFilter, hasPermission]);

    const fetchSubcription = async () => {
        try {
            const res = await axios.get(`${API_URL}/subcription?page=${page}&limit=${limit}&search=${search}&billingCycle=${statusFilter}`,
                { withCredentials: true }
            );
            setSubcription(res.data.plans);  
            setTotalPage(res.data.totalPages);
            setPage(res.data.currentPage);

        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };
    const Delete = async (id) => {
        try {
            await axios.delete(`${API_URL}/subcription/${id}`, { withCredentials: true });
            fetchSubcription();

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
        header: "PLAN NAME",
        accessor: "planName",
        
    },
    {
        header: "BILLING CYCLE",
        render: (item) => (
            <span className="badge-active">
                {item.billingCycle}   {/* ✅ FIX */}
            </span>
        )
    },
    {
        header: "PRICE",
        render: (item) => (
            <h6 className="value-code">
                ${item.price}   {/* ✅ FIX */}
            </h6>
        )
    }
];
    return (
        <div className="p-6">
            <PageHeader
                title="Subcription Plan"
                onCreate={() => navigate("/subcription/create")}
                createPermission="subcription.create"
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
                    statusOptions={["Monthly", "Quterly", "Half-Yearly", "Yearly"]}
                />
                <CommonTable
                    columns={column}
                    data={subcription}
                    onEdit={(item) => navigate(`/subcription/edit/${item._id}`, { state: item })}
                    onDelete={(item) =>
                        showConfirm({
                            id: item._id,
                            name: item.name,
                            onConfirm: () => Delete(item._id),
                        })
                    }
                    actions
                    editPermission="subcription.update"
                    deletePermission="subcription.delete"
                />
                <Pagination page={page} totalPages={totalpage} setPages={setPage} />
            </div>
        </div>
    );
}
export default Subcription;