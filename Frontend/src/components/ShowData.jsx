import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";


function Showdata({ limit, type,setLimit, search, setSearch, setPage, statusFilter, setStatusFilter, statusOptions = [], assigneeFilter,
    setAssigneeFilter, assigneeOptions = [] }) {

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const urlLimit = searchParams.get("limit");
        const urlSearch = searchParams.get("search");
        const urlStatus = searchParams.get("status");
        const urlAssignee = searchParams.get("assignedTo");

        if (urlAssignee) setAssigneeFilter(urlAssignee);
        if (urlLimit) setLimit(Number(urlLimit));
        if (urlSearch) setSearch(urlSearch);
        if (urlStatus) setStatusFilter(urlStatus);
    }, []);

    const handleLimitChange = (val) => {
        setLimit(val);
        setSearchParams({ ...Object.fromEntries(searchParams.entries()), limit: val });
    };

    const handleSearchChange = (val) => {
        setSearch(val);
        setSearchParams({ ...Object.fromEntries(searchParams.entries()), search: val });
    };

    const handleStatusChange = (val) => {
        setStatusFilter(val);
        setPage(1);
        setSearchParams({ ...Object.fromEntries(searchParams.entries()), status: val });
    };
    const handleAssigneeChange = (val) => {
        setAssigneeFilter(val);
        setPage(1);

        setSearchParams({
            ...Object.fromEntries(searchParams.entries()),
            assignedTo: val
        });
    };

    return (
        <div className="showdata flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-3 bg-gray-100 p-3 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-[16px] text-gray-700">
                <strong>Show:</strong>
                <select
                    className="border border-black-800 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-gray-300"
                    value={limit}
                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                </select>

                {/* ✅ Status Dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <strong>Status:</strong>
                    <select
                        className="border rounded px-3 py-1"
                        value={statusFilter}
                        onChange={(e) => {
                            handleStatusChange(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All</option>
                        {statusOptions.map((status, index) => (
                            <option key={index} value={status.value || status}>
                                {status.label || status}
                            </option>
                        ))}
                    </select>
                </div>
                {/* ✅ Assignee Dropdown */}
                {(type === "task" || type === "issue") && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <strong>Assignee:</strong>

                        <select
                            className="border rounded px-3 py-1"
                            value={assigneeFilter || ""}
                            onChange={(e) => handleAssigneeChange(e.target.value)}
                        >
                            <option value="">All</option>

                            {assigneeOptions.map((user, index) => (
                                <option key={index} value={user.value}>
                                    {user.staff || user.label || user.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-[16px] text-gray-700 w-full lg:w-auto">
                <strong>Search:</strong>
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => {
                        handleSearchChange(e.target.value);
                        setPage(1);
                    }}
                    className="border rounded px-3 py-1 w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
            </div>

        </div>
    );
}
export default Showdata;