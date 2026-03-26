import { usePermission } from "../context/PermissionContext";
import { useState, useContext } from "react";
import axios from "axios";
import { useCompany } from "../context/companyContext";
import { AuthContext } from "../context/AuthContext";
const API_URL = import.meta.env.VITE_API_URL;

function PageHeader({ title, onCreate, createPermission, onUpload, type, onBulkUpload }) {
    const { hasPermission } = usePermission();;
    const { user } = useContext(AuthContext);
    const { hasModule } = useCompany();
    const hasBulkUpload = hasModule("bulkupload");

    return (
        <nav className="pageheader flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 rounded-lg">
            <h4 className="text-xl sm:text-2xl font-extrabold text-slate-800">{title}</h4>
            <div className="flex items-center gap-3">
                {(type == "task" || type == "issue") && createPermission && hasPermission(createPermission) && (
                    <button
                        onClick={hasBulkUpload || user?.isSuperAdmin === true ? onBulkUpload : undefined} 
                        className={`btn-primary2 ${!hasBulkUpload && user?.isSuperAdmin === false ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        🢁 BulkUpload
                    </button>
                )}
                {type == "document" && createPermission && hasPermission(createPermission) && (
                    <button
                        className="btn-primary2"
                        onClick={onUpload}
                    >
                        🢁 Upload
                    </button>
                )}
                {createPermission && hasPermission(createPermission) && (
                    <button
                        className="btn-primary"
                        onClick={onCreate}
                    >
                        Create
                    </button>
                )}
            </div>
        </nav>

    );
}
export default PageHeader;