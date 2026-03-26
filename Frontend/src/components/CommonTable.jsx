import { usePermission } from "../context/PermissionContext.jsx";

function CommonTable({ columns, data, onEdit, onDelete, onView, actions, editPermission, deletePermission, viewPermission, onDownload, downloadPermission }) {
    const { hasPermission } = usePermission();

    //Check permissions once
    const canEdit = onEdit && editPermission && hasPermission(editPermission);
    const canDelete = onDelete && deletePermission && hasPermission(deletePermission);
    const canView = onView && viewPermission && hasPermission(viewPermission);
    const canDownload = (item) => onDownload && downloadPermission && hasPermission(downloadPermission) && ["txt", "docx"].includes(item.documentType);

    //Show action column only if at least one allowed
    const showActions = actions && (canEdit || canDelete || canView);


    return (
        <div className="bg-white rounded-lg shadow p-4 overflow-x-auto  relative">
            <table className="hidden md:table w-full table-fixed">
                <thead className="bg-accent text-indigo-700 uppercase text-xs tracking-wider">
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} className={`px-3 py-3 text-[15px] ${col.width || ""} ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"}}`}>{col.header}</th>
                        ))}
                        {showActions && <th className="px-3 py-3 text-center text-[15px]">ACTIONS</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.length > 0 ? (
                        data.map((item, rowIndex) => (
                            <tr key={rowIndex} className="even:bg-slate-100/100 hover:bg-indigo-50/50 transition duration-150 group">
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className={`px-3 py-3 text-[16px] text-slate-700 ${col.width || ""} ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"}`}>
                                        {col.render ? col.render(item, rowIndex) : item[col.accessor]}
                                    </td>
                                ))}
                                {showActions && (
                                    <td className="px-3 py-3 whitespace-nowrap text-center">
                                        <div className="flex items-center gap-2 justify-center">
                                            {canView && (
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => onView(item)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-blue-600 cursor-pointer hover:scale-110 transition-transform">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.399 8.049 7.21 5 12 5c4.79 0 8.601 3.049 9.964 6.678.057.153.057.332 0 .485-1.363 3.629-5.174 6.678-9.964 6.678-4.79 0-8.601-3.049-9.964-6.678Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                    </svg>
                                                    {/* ✏️ */}
                                                </button>
                                            )}
                                            {canDownload(item) && (
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => onDownload(item)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-black-600 cursor-pointer hover:scale-110 transition-transform">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l4-4m-4 4l-4-4m-6 6h16" />
                                                    </svg>
                                                    {/* ✏️ */}
                                                </button>
                                            )}
                                            {canEdit && (
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => onEdit(item)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-blue-600 cursor-pointer hover:scale-110 transition-transform">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                    </svg>
                                                    {/* ✏️ */}
                                                </button>
                                            )}

                                            {canDelete && (
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => onDelete(item)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-red-500 cursor-pointer hover:scale-110 transition-transform">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                    {/* 🗑 */}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}

                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-gray-500">No Data Found</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-5 overflow-hidden">
                {data.length > 0 ? (
                    data.map((item, rowIndex) => (
                        <div
                            key={rowIndex}
                            className="border rounded-lg p-4 shadow-sm bg-white"
                        >
                            {columns.map((col, colIndex) => (
                                <div
                                    key={colIndex}
                                    className="flex flex-col gap-1 p-3 border-b last:border-b-0"
                                >
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        {col.header}
                                    </span>

                                    <span className="text-sm text-gray-800 break-words">
                                        {col.render
                                            ? col.render(item, rowIndex)
                                            : item[col.accessor]}
                                    </span>
                                </div>
                            ))}

                            {showActions && (
                                <div className="flex justify-end gap-3 mt-3">
                                    {canView && (
                                        <button
                                            className="edit-btn"
                                            onClick={() => onView(item)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-blue-600 cursor-pointer hover:scale-110 transition-transform">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.399 8.049 7.21 5 12 5c4.79 0 8.601 3.049 9.964 6.678.057.153.057.332 0 .485-1.363 3.629-5.174 6.678-9.964 6.678-4.79 0-8.601-3.049-9.964-6.678Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            </svg>
                                            {/* ✏️ */}
                                        </button>
                                    )}
                                    {canEdit && (
                                        <button
                                            className="edit-btn"
                                            onClick={() => onEdit(item)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-blue-600 cursor-pointer hover:scale-110 transition-transform">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                            </svg>
                                            {/* ✏️ */}
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button
                                            className="delete-btn"
                                            onClick={() => onDelete(item._id)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-red-500 cursor-pointer hover:scale-110 transition-transform">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                            {/* 🗑 */}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-4">
                        No Data Found
                    </div>
                )}
            </div>

        </div>
    );
}
export default CommonTable;