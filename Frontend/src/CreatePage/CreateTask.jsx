import { useNavigate, useLocation, useParams } from "react-router-dom";
import ReuseForm from "../components/reuseForm.jsx";
import { useState, useEffect } from "react";
import axios from "axios";
import { usePermission } from "../context/PermissionContext.jsx";

function CreateTask() {
    const [staff, setStaff] = useState([]);
    const [statusList, setStatusList] = useState([]);  
    const navigate = useNavigate();
    const { state } = useLocation();
    const { id } = useParams();
    const { hasPermission } = usePermission();
    

    useEffect(() => {
        if (hasPermission("staff.read")) {
            fetchStaff();
        }

        if (hasPermission("taskstatus.read")) {
            fetchTaskStatus(); 
        }
    }, [hasPermission]);

    const fetchStaff = async () => {
        try {
            const res = await axios.get("http://localhost:9824/staff?page=1&limit=1000", { withCredentials: true });
            setStaff(res.data.staff);
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };

    const fetchTaskStatus = async () => {
        try {
            const res = await axios.get("http://localhost:9824/taskstatus?page=1&limit=1000",{ withCredentials: true });

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
                apiUrl={id ? `http://localhost:9824/task/${id}` : "http://localhost:9824/task"}
                fields={[
                    {
                        name: "name",
                        label: "Task",
                        fieldType: "input",
                        type: "text",
                        placeholder: "Enter Your Task",
                    },
                    {
                        name: "description",
                        label: "Description",
                        fieldType: "input",
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
                        label: "Assign",
                        fieldType: "select",
                        options: hasPermission("staff.read")?staff.map((s) => ({
                            label: s.name,
                            value: s._id
                        })):[]
                    },
                    {
                        name: "taskStatus",     // must match backend schema field
                        label: "Task Status",
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