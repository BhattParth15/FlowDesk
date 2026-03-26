import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import { useProject } from "../context/ProjectContext";

const API_URL = import.meta.env.VITE_API_URL;

function CreateBulkUpload() {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { selectedProject } = useProject();

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get("type") || "data";

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            setPreviewData(jsonData);
        };
        reader.readAsArrayBuffer(selectedFile);
    };

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        formData.append("projectId", selectedProject._id);

        try {
            setLoading(true);
            const res = await axios.post(`${API_URL}/bulk/upload`, formData, { withCredentials: true });
            console.log(res.data.message);
            navigate(type === "task" ? "/task" : "/issue");
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">

                {/* Header Section - Reduced Padding */}
                <div className="bg-blue-500 px-6 py-4">
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>📁</span> Bulk Upload {type.toUpperCase()}
                    </h1>
                    <p className="text-blue-100 text-xs mt-0.5">
                        Import items via Excel spreadsheet.
                    </p>
                </div>

                <div className="p-6"> {/* Reduced from p-8 */}
                    {/* Upload Area - Reduced Height (p-10 to py-6) */}
                    <div className="relative group">
                        <input
                            type="file"
                            accept=".xlsx"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`border-2 border-dashed rounded-lg py-6 flex flex-col items-center justify-center transition-all ${file ? "border-green-400 bg-green-50" : "border-gray-300 bg-gray-50 group-hover:border-blue-400 group-hover:bg-blue-50"
                            }`}>
                            <div className="text-3xl mb-1">{file ? "✅" : "📄"}</div>
                            <p className="text-gray-700 text-sm font-medium">
                                {file ? file.name : "Click or drag XLSX file here"}
                            </p>
                            {!file && <p className="text-gray-400 text-[10px] mt-1">Max 20MB</p>}
                        </div>
                    </div>

                    {/* Preview Section - Smaller Heading */}
                    {previewData.length > 0 && (
                        <div className="mt-5 animate-fadeIn">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex justify-between px-1">
                                Data Preview <span>{previewData.length} Rows</span>
                            </h3>

                            <div className="border rounded-md overflow-hidden max-h-48 overflow-y-auto shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 sticky top-0 border-b">
                                        <tr>
                                            {Object.keys(previewData[0]).map((key) => (
                                                <th key={key} className="p-2 text-[11px] font-bold text-gray-600 uppercase whitespace-nowrap">
                                                    {key}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {previewData.slice(0, 5).map((row, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                {Object.values(row).map((val, j) => (
                                                    <td key={j} className="p-2 text-xs text-gray-600 truncate max-w-[120px]">
                                                        {val}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {previewData.length > 5 && (
                                    <div className="bg-gray-50 p-1.5 text-center text-[10px] text-gray-400 border-t italic">
                                        +{previewData.length - 5} more rows
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Footer / Actions - Reduced Margin */}
                    <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                        <button
                            onClick={() => navigate(`/${type}`)}
                            className="px-4 py-1.5 text-sm text-gray-500 font-medium hover:bg-gray-100 rounded-md transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={loading || !file}
                            className={`px-6 py-1.5 rounded-md text-sm font-bold text-white shadow-md flex items-center gap-2 transition active:scale-95 ${loading || !file
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                    Uploading...
                                </>
                            ) : (
                                "Import Data"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default CreateBulkUpload;