import { useNavigate, useLocation, useParams } from "react-router-dom";
import ReuseForm from "../components/reuseForm.jsx";
import { useState, useEffect } from "react";
import axios from "axios";
import { usePermission } from "../context/PermissionContext.jsx";
import { useProject } from "../context/ProjectContext.jsx";
const API_URL = import.meta.env.VITE_API_URL;

function CreateTask() {
    const [staff, setStaff] = useState([]);
    const [statusList, setStatusList] = useState([]);  
    const navigate = useNavigate();
    const { state } = useLocation();
    const { id } = useParams();
    const { hasPermission } = usePermission();
    const { selectedProject } = useProject();
    
    

    useEffect(() => {
        if (!selectedProject?._id) return;

        if (hasPermission("staff.read")) {
            fetchStaff();
        }

        if (hasPermission("taskstatus.read")) {
            fetchTaskStatus(); 
        }
    }, [hasPermission,selectedProject]);

    const fetchStaff = async () => {
        try {
            //const res = await axios.get(`${API_URL}/staff?page=1&limit=1000`, { withCredentials: true });
            const res=await axios.get(`${API_URL}/staff/project?projectId=${selectedProject._id}&page=1&limit=1000`, { withCredentials: true })
            setStaff(res.data.staff);
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };

    const fetchTaskStatus = async () => {
        try {
            //const res = await axios.get(`${API_URL}/taskstatus?page=1&limit=1000`,{ withCredentials: true });
            const res=await axios.get(`${API_URL}/taskstatus?projectId=${selectedProject._id}&page=1&limit=1000`, { withCredentials: true })
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
                title={id ? "Edit Task" : "Create Task"}
                method={id ? "put" : "post"}
                apiUrl={id ? `${API_URL}/task/${id}` : `${API_URL}/task`}
                fields={[
                    {
                        name: "name",
                        required: true,
                        label: "Task",
                        fieldType: "input",
                        type: "text",
                        placeholder: "Enter Your Task",
                    },
                    {
                        name: "description",
                        required: true,
                        label: "Description",
                        fieldType: "textarea",
                        type: "text",
                        placeholder: "Enter Task Description"
                    },
                    {
                        name: "image",
                        label: "Task Images",
                        fieldType: "file",
                        type: "image",
                    },
                    {
                        name: "video",
                        label: "Task Video",
                        fieldType: "file",
                        type: "video",
                    },
                    {
                        name: "assignedTo",
                        required: true,
                        label: "Assignee",
                        fieldType: "select",
                        options: hasPermission("staff.read")?staff.map((s) => ({
                            label: s.name,
                            value: s._id
                        })):[]
                    },
                    {
                        name: "taskStatus",     // must match backend schema field
                        label: "Task Status",
                        required: true,
                        fieldType: "select",
                        options: statusList.map((status) => ({
                            label: status.name, 
                            value: status._id
                        }))
                    }
                ]}
                initialData={state}
                onClose={() => navigate("/task")}
                onSuccess={() => navigate("/task")}
            />
        </div>
    );
}
export default CreateTask;