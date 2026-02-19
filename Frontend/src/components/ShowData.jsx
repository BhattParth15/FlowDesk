function Showdata({ limit, setLimit, search, setSearch, setPage, statusFilter, setStatusFilter, statusOptions = [] }) {
    return (
        <div className="showdata flex justify-between items-center mb-4 bg-gray">
            <div className="flex items-center gap-3 text-sm text-gray-700">
                <strong>Show:</strong>
                <select
                    className="border border-black-800 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-gray-300"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                </select>

                {/* ✅ Status Dropdown */}
                <div className="flex items-center gap-2">
                    <strong>Status:</strong>
                    <select
                        className="border rounded px-3 py-1"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
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
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
                <strong>Search:</strong>
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="border rounded px-3 py-1 w-64 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
            </div>

        </div>
    );
}
export default Showdata;