import axios from "axios";
import { useEffect, useState, useContext } from "react";
import PageHeader from "../components/Pageheader.jsx";
import Showdata from "../components/ShowData.jsx";
import CommonTable from "../components/CommonTable.jsx";
import Pagination from "../components/Pagination.jsx";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../context/PermissionContext";
import { useConfirmModal } from "../context/DeleteConfirmContext.jsx";
import { useProject } from "../context/ProjectContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { saveAs } from "file-saver";


const API_URL = import.meta.env.VITE_API_URL;

function Document() {
    const [documents, setDocuments] = useState([]);
    const [staff, setStaff] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalPage, setTotalPage] = useState(1);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const { hasPermission } = usePermission();
    const { showConfirm } = useConfirmModal();
    const { selectedProject } = useProject();
    const { user, logout } = useContext(AuthContext);

    useEffect(() => {

        if (hasPermission("document.read")) {
            fetchDocuments();
        }

        if (hasPermission("staff.read")) {
            fetchStaff();
        }
    }, [page, limit, search, selectedProject, hasPermission]);

    // Fetch Documents
    const fetchDocuments = async () => {
        try {
            let url = `${API_URL}`;
            if (selectedProject && selectedProject._id !== "all") {
                url += `/document?projectId=${selectedProject._id}&page=${page}&limit=${limit}&search=${search}`;
            } else if (selectedProject?._id === "all" && selectedProject.projectIds?.length) {
                url += `/document?page=${page}&limit=${limit}&search=${search}&projectIds=${selectedProject.projectIds.join(",")}`;
            }
            const res = await axios.get(url, { withCredentials: true });
            setDocuments(res.data.data);
            setPage(res.data.page);
            setTotalPage(res.data.totalPages);
        }
        catch (err) {
            console.log(err.response?.data || err.message);
        }
    };
    // Fetch Staff
    const fetchStaff = async () => {
        try {
            let url = `${API_URL}`;
            if (selectedProject && selectedProject._id !== "all") {
                url += `/staff/project?page=1&limit=1000&projectId=${selectedProject._id}`;
            } else {
                url += `/staff?page=1&limit=1000`;
            }
            const res = await axios.get(url, { withCredentials: true });
            setStaff(res.data.staff);
        }
        catch (err) {
            console.log(err.response?.data || err.message);
        }

    };
    const deleteDocument = async (id) => {
        try {
            await axios.delete(`${API_URL}/document/${id}`, { withCredentials: true });
        }
        catch (err) {
            console.log(err);
        }
    };

    const requestAccess = async (documentId) => {
        try {
            await axios.post(`${API_URL}/document/request-access`, { documentId }, { withCredentials: true });

        }
        catch (err) {
            console.log(err);
        }
    };
    const handleUploadClick = () => {
        if (!selectedProject || selectedProject._id === "all") {
            setError("Please select Project first");
            setTimeout(() => setError(""), 3000);
            return;
        }
        navigate("/document/create");
    };
    const handleCreateClick = () => {
        if (!selectedProject || selectedProject._id === "all") {
            setError("Please select Project first");
            setTimeout(() => setError(""), 3000);
            return;
        }
        navigate("/document/create-text");
    };

    const handleEditClick = (item) => {
        if (!selectedProject || selectedProject._id === "all") {
            setError("Please select Project first");
            setTimeout(() => setError(""), 3000);
            return;
        }
        if (item.documentType === "txt" || item.documentType === "docx") {
            navigate(`/document/page/${item._id}`, { state: { doc: item } });
        } else {
            navigate(`/document/edit/${item._id}`, { state: item });

        }
    };

    const columns = [
        {
            header: "#",
            align: "center",
            width: "w-[40px]",
            render: (item, index) => (page - 1) * limit + index + 1
        },
        {
            header: "TITLE",
            align: "left",
            width: "w-[250px]",
            accessor: "name"
        },
        {
            header: "TYPE",
            align: "left",
            width: "w-[250px]",
            render: (item) => {
                const type = item.documentType || "-";
                const typeColors = {
                    pdf: "bg-green-200 text-green-800",
                    doc: "bg-blue-200 text-blue-800",
                    docx: "bg-blue-200 text-blue-800",
                    ppt: "bg-orange-200 text-orange-800",
                    pptx: "bg-orange-200 text-orange-800",
                    xls: "bg-purple-200 text-purple-800",
                    xlsx: "bg-purple-200 text-purple-800",
                    default: "bg-gray-200 text-gray-800"
                };
                const colorClass = typeColors[type] || typeColors.default;
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                        {type.toUpperCase()}
                    </span>
                );
            }
        },
        {
            header: "FILE",
            align: "left",

            render: (item) => {
                const isSuperAdmin = user?.isSuperAdmin === true;
                const userId = user?.id?.toString();
                const isOwner =
                    item.ownerId?.toString() === userId;
                const isAllowed =
                    item.allowedUsers?.some(
                        id => id.toString() === userId
                    );
                const existingRequest =
                    item.accessRequests?.find(
                        r => r.userId?.toString() === userId
                    );
                if (isOwner || isAllowed || isSuperAdmin) {
                    const permission = item.access?.find(a => a.userId?.toString() === userId?.toString())?.permission;
                    const canEdit = permission === "edit" || isOwner;
                    return (
                        <div>
                            <button
                                onClick={() => {
                                    if (item.documentType === "txt" || item.documentType === "docx") {
                                        if (!selectedProject || selectedProject._id === "all") {
                                            setError("Please select Project first");
                                            setTimeout(() => setError(""), 3000);
                                            return;
                                        }
                                        navigate(`/document/${canEdit ? "page" : "view-text"}/${item._id}`, { state: { doc: item } });
                                    } else {
                                        navigate(`/document/view/${item._id}`);
                                    }
                                }}
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 inline-flex items-center justify-center"
                            >
                                View
                            </button>
                        </div>
                    );
                }
                if (existingRequest?.status === "pending") {
                    return (
                        <div>
                            <button
                                className="bg-gray-400 text-white px-3 py-1 rounded cursor-not-allowed"
                                disabled
                            >
                                Request Pending
                            </button>
                        </div>
                    );
                }
                return (
                    <div>
                        <button
                            onClick={() => requestAccess(item._id)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                            Request Access
                        </button>
                    </div>
                );
            }
        }
        // {
        //     header: "ACCESS",
        //     render: (item) => {
        //         const hasAccess = item.hasAccess;
        //         if (hasAccess) {
        //             return (
        //                 <button
        //                     onClick={() => navigate(`/document/view/${item._id}`)}
        //                     className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
        //                 >
        //                     View
        //                 </button>
        //             );
        //         }
        //         else {
        //             return (
        //                 <button
        //                     onClick={() => requestAccess(item._id)}
        //                     className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
        //                 >
        //                     Request Access
        //                 </button>
        //             );
        //         }
        //     }
        // },
    ];

    const handleDownload = async (item) => {
        try {
            const response = await axios.get(`${API_URL}/document/download/${item._id}`, {
                responseType: "blob",
                withCredentials: true
            });

            const filename = `${item.name || "Untitled"}.pdf`; // always PDF
            saveAs(response.data, filename);

        } catch (err) {
            console.error("Download error:", err);

        }
    };

    return (
        <div className="p-6">
            <PageHeader
                title="All Documents"
                type="document"
                onUpload={handleUploadClick}
                onCreate={handleCreateClick}

                createPermission="document.create"
            />
            <div className="table-card">
                <Showdata
                    limit={limit}
                    setLimit={(newLimit) => {
                        setLimit(newLimit);
                        setPage(1);
                    }}
                    search={search}
                    setSearch={setSearch}
                    setPage={setPage}
                />
                <CommonTable
                    columns={columns}
                    data={documents}
                    onEdit={(item) => handleEditClick(item)}
                    onDownload={(item) => handleDownload(item)}
                    onDelete={(item) =>
                        showConfirm({
                            id: item._id,
                            name: item.name,
                            onConfirm: () => deleteDocument(item._id)
                        })
                    }
                    actions
                    editPermission="document.update"
                    deletePermission="document.delete"
                    downloadPermission="document.read"
                />
                <Pagination
                    page={page}
                    totalPages={totalPage}
                    setPages={setPage}
                />
            </div>
            {error && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-6 py-3 rounded-lg shadow-lg z-[500] border border-red-200 min-w-[300px] text-center">
                    {error}
                </div>
            )}
        </div>
    );
}

export default Document;