import { useNavigate, useLocation, useParams } from "react-router-dom";
import ReuseForm from "../components/reuseForm.jsx";
import { useState, useEffect } from "react";
import axios from "axios";
import { usePermission } from "../context/PermissionContext.jsx";
import { useProject } from "../context/ProjectContext.jsx";
const API_URL = import.meta.env.VITE_API_URL;

function CreateTaskIssue() {
    const [staff, setStaff] = useState([]);
    const [statusList, setStatusList] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = useLocation();
    const { id } = useParams();
    const { hasPermission } = usePermission();
    const { selectedProject } = useProject();
    const mode = location.pathname.includes("issue") ? "issue" : "task";


    useEffect(() => {
        if (!selectedProject?._id) return;

        if (hasPermission("staff.read")) {
            fetchStaff();
        }

        if (hasPermission("taskstatus.read")) {
            fetchTaskStatus();
        }
    }, [hasPermission, selectedProject, mode]);

    const fetchStaff = async () => {
        try {
            //const res = await axios.get(`${API_URL}/staff?page=1&limit=1000`, { withCredentials: true });
            const res = await axios.get(`${API_URL}/staff/project?projectId=${selectedProject._id}&page=1&limit=1000`, { withCredentials: true })
            setStaff(res.data.staff);
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };

    const fetchTaskStatus = async () => {
        try {
            //const res = await axios.get(`${API_URL}/taskstatus?page=1&limit=1000`,{ withCredentials: true });
            const res = await axios.get(`${API_URL}/taskstatus?projectId=${selectedProject._id}&page=1&limit=1000`, { withCredentials: true })
            const Data = res.data.taskStatus || res.data;

            // ✅ CHANGE: Show ONLY Active status
            const activeStatus = Array.isArray(Data)
                ? Data.filter((item) => item.status === "Active")
                : [];

            setStatusList(activeStatus);

        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };

    return (
        <div className="main-container">
            <ReuseForm
                title={id ? `Edit ${mode === "issue" ? "Issue" : "Task"}` : `Create ${mode === "issue" ? "Issue" : "Task"}`}
                method={id ? "put" : "post"}
                apiUrl={
                    id
                        ? `${API_URL}/task/${id}?type=${mode}`
                        : `${API_URL}/task?type=${mode}`
                }
                fields={[
                    {
                        name: "name",
                        required: true,
                        label: mode === "issue" ? "Issue" : "Task",
                        fieldType: "input",
                        type: "text",
                        placeholder: `Enter Your ${mode === "issue" ? "Issue" : "Task"}`,
                    },
                    {
                        name: "description",
                        required: true,
                        label: "Description",
                        fieldType: "textarea",
                        type: "text",
                        placeholder: "Enter Description"
                    },
                    {
                        name: "image",
                        label: "Images",
                        fieldType: "file",
                        type: "image",
                    },
                    {
                        name: "video",
                        label: "Video",
                        fieldType: "file",
                        type: "video",
                    },
                    {
                        name: "assignedTo",
                        required: true,
                        label: "Assign",
                        fieldType: "select",
                        options: hasPermission("staff.read") ? staff.map((s) => ({
                            label: s.name,
                            value: s._id
                        })) : []
                    },
                    {
                        name: "taskStatus",     // must match backend schema field
                        label: mode === "issue" ? "Issue Status" : "Task Status",
                        required: true,
                        fieldType: "select",
                        options: statusList.map((status) => ({
                            label: status.name,
                            value: status._id
                        }))
                    },
                    ...(mode === "issue"
                        ? [{
                            name: "priority",
                            required: true,
                            label: "Priority",
                            fieldType: "select",
                            options: [
                                { label: "High", value: "High" },
                                { label: "Medium", value: "Medium" },
                                { label: "Low", value: "Low" }
                            ]
                        }]
                        : [])
                ]}
                initialData={state}
                onClose={() => navigate(`/${mode}`)}
                onSuccess={() => navigate(`/${mode}`)}
            />
        </div>
    );
}
export default CreateTaskIssue;