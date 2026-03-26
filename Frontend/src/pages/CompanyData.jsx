import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/Pageheader.jsx";
import Showdata from "../components/ShowData.jsx";
import CommonTable from "../components/CommonTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { usePermission } from "../context/PermissionContext.jsx";
import { useConfirmModal } from "../context/DeleteConfirmContext.jsx";
import ViewModal from "../View/ViewModuleData.jsx";

const API_URL = import.meta.env.VITE_API_URL;

function Company() {
    const [company, setCompany] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalpage, setTotalPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [viewData, setViewData] = useState(null);
    const [showView, setShowView] = useState(false);

    const navigate = useNavigate();
    const { hasPermission } = usePermission();
    const { showConfirm } = useConfirmModal();

    useEffect(() => {
        if (hasPermission("company.read")) {
            fetchCompany();
        }
    }, [page, limit, search, statusFilter, hasPermission]);

    const fetchCompany = async () => {
        try {
            const res = await axios.get(`${API_URL}/company?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}`,{ withCredentials: true });
            setCompany(res.data.company);
            setTotalPage(res.data.totalPages);
            setPage(res.data.currentPage);
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };
    const Delete = async (id) => {
        try {
            await axios.delete(`${API_URL}/company/${id}`, { withCredentials: true });
        } catch (err) {
            console.log(err.message);
        }
    };

    const column = [
        {
            header: "#",
            align: "left",
            width: "w-[40px]",
            render: (item, index) => (page - 1) * limit + index + 1
        },
        {
            header: "COMPANY NAME",
            align: "left",
            width: "w-[200px]",
            accessor: "companyName"
        },
        // {
        //     header: "GST NUMBER",
        //     align: "left",
        //     width: "w-[170px]",
        //     accessor: "GSTNumber"
        // },
        {
            header: "COMPANY EMAIL",
            align: "left",
            width: "w-[250px]",
            accessor: "companyEmail"
        },
        // {
        //     header: "PHONE",
        //     align: "center",
        //     width: "w-[120px]",
        //     accessor: "phone"
        // },
        {
            header: "COMPANY TYPE",
            align: "left",
            width: "w-[250px]",
            render: (item) => (
                <span className="bg-gradient-to-b from-purple-300 to-indigo-300  text-blue-800 px-2 py-1 rounded">
                    {item.companyType}
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
    return (
        <div className="p-6">
            <PageHeader
                title="Companies"
                //onCreate={() => navigate("/company/create")}
                //createPermission="company.create"
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
                    statusOptions={["Active", "Inactive","Deleted"]}
                />
                <CommonTable
                    columns={column}
                    data={company}
                    onEdit={(item) =>navigate(`/company-register/edit/${item._id}`, { state: item })}
                    onView={(item) => {
                        setViewData(item);
                        setShowView(true);
                    }}
                    onDelete={(item) =>
                        showConfirm({
                            id: item._id,
                            name: item.companyName,
                            onConfirm: () => Delete(item._id),
                        })
                    }
                    type="company"
                    actions
                    viewPermission="company.read"
                    editPermission="company.update"
                    deletePermission="company.delete"
                />
                <ViewModal
                    open={showView}
                    data={viewData}
                    onClose={() => setShowView(false)}
                    fields={[
                        { label: "Company Name", key: "companyName" },
                        { label: "GST Number", key: "GSTNumber" },
                        { label: "Phone", key: "phone" },
                        { label: "Owner Email", key: "ownerEmail" },
                        { label: "Owner Phone", key: "ownerPhone" },
                        { label: "Address", key: "companyAddress", type: "text" },
                        { label: "Created", key: "createdAt", type: "date" }
                    ]}
                />
                <Pagination
                    page={page}
                    totalPages={totalpage}
                    setPages={setPage}
                />
            </div>
        </div>
    );
}
export default Company;