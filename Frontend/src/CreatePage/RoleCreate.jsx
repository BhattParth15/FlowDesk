import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import CommonTable from "../components/CommonTable";
import { usePermission } from "../context/PermissionContext";
const API_URL = import.meta.env.VITE_API_URL;

function CreateRole() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { id } = useParams();

    const [name, setName] = useState(state?.name || "");
    const [status, setStatus] = useState(state?.status || "");
    const [permissions, setPermissions] = useState([]);
    const [selected, setSelected] = useState({});

    const {hasPermission}=usePermission();

    useEffect(() => {
        if(hasPermission("permission.read")){
            fetchPermissions();
        }
    }, [hasPermission]);

    useEffect(() => {
        // Check if we are in Edit Mode (id exists) and have permission strings
        if (id && state?.permissions && permissions.length > 0) {
            const mapped = {};

            permissions.forEach(p => {
                const permission_name = p.value; // e.g., "staff"

                mapped[p._id] = {
                    // Check if the specific action string exists in the DB array
                    read: state.permissions.includes(`${permission_name}.read`),
                    create: state.permissions.includes(`${permission_name}.create`),
                    update: state.permissions.includes(`${permission_name}.update`),
                    delete: state.permissions.includes(`${permission_name}.delete`)
                };
            });

            setSelected(mapped);
        }
    }, [state, permissions, id]); // Added permissions and id to dependencies

    const fetchPermissions = async () => {
        const res = await axios.get(`${API_URL}/permission?page=1&limit=1000`, { withCredentials: true });
        setPermissions(res.data.permissions);
    };

    const handleCheck = (permId, type) => {
        setSelected(prev => ({
            ...prev,
            [permId]: { ...prev[permId], [type]: !prev[permId]?.[type] }
        }));
    };

    const columns = [
        {
            header:"MODULE NAME",
            accessor: "name"
        },
        {
            header: "READ",
            render: (item) => (
                <input type="checkbox" checked={selected[item._id]?.read || false} onChange={() => handleCheck(item._id, 'read')} />
            )
        },
        {
            header: "CREATE",
            render: (item) => (
                <input type="checkbox" checked={selected[item._id]?.create || false} onChange={() => handleCheck(item._id, 'create')} />
            )
        },
        {
            header: "UPDATE",
            render: (item) => (
                <input type="checkbox" checked={selected[item._id]?.update || false} onChange={() => handleCheck(item._id, 'update')} />
            )
        },
        {
            header: "DELETE",
            render: (item) => (
                <input type="checkbox" checked={selected[item._id]?.delete || false} onChange={() => handleCheck(item._id, 'delete')} />
            )
        }
    ];
    const handleSubmit = async () => {
        try {
            // Convert the "selected" state into the array the backend expects
            const permissionArray = Object.keys(selected).map((id) => ({
                permissionId: id, // Ensure this is the _id of the permission
                read: selected[id].read || false,
                create: selected[id].create || false,
                update: selected[id].update || false,
                delete: selected[id].delete || false,
            }));

            const payload = {
                name,
                status,
                permissions: permissionArray
            };

            const url = id ? `${API_URL}/role/${id}` : `${API_URL}/role`;
            const method = id ? "put" : "post";

            await axios[method](url, payload, { withCredentials: true });
            navigate("/role");
        } catch (err) {
            console.log("Error Detail:", err.response?.data);
        }
    };

    return (
        <div className="flex-1 p-8 bg-gray-100 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                    {id ? "Edit Role" : "Create Role"}
                </h2>
            </div>
            {/* Role Info Card */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter name"
                            className="w-full border border-gray-300 rounded-md px-4 py-2 
                       focus:ring-2 focus:ring-red-400 focus:outline-none"
                        />
                    </div>
                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-4 py-2 
                       focus:ring-2 focus:ring-red-400 focus:outline-none"
                        >
                            <option value="">Select Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Deleted">Deleted</option>
                        </select>
                    </div>

                </div>
            </div>
            {/* Permission Table Card */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Assign Permissions
                </h3>
                <div className="overflow-x-auto">
                    <CommonTable
                        title="Assign Permissions"
                        columns={columns}
                        data={permissions}
                    />
                </div>
            </div>
            {/* Bottom Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-8 pt-4 border-t">

                <button
                    onClick={() => navigate("/role")}
                    className="btn-outline-danger px-5 py-2 w-full sm:w-auto"
                >
                    Cancel
                </button>

                <button
                    onClick={handleSubmit}
                    className="btn-primary px-5 py-2 w-full sm:w-auto"

                    //     className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 
                    // rounded-md shadow font-medium transition"
                >
                    {id ? "Update" : "Create"}
                </button>

            </div>

        </div>
    );

}

export default CreateRole;