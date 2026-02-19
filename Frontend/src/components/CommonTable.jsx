import { usePermission } from "../context/PermissionContext.jsx";

function CommonTable({ columns, data, onEdit, onDelete, actions, editPermission, deletePermission }) {
    const { hasPermission } = usePermission();

    //Check permissions once
    const canEdit = onEdit && editPermission && hasPermission(editPermission);
    const canDelete = onDelete && deletePermission && hasPermission(deletePermission);

    //Show action column only if at least one allowed
    const showActions = actions && (canEdit || canDelete);


    return (
        <div className="bg-white rounded-lg shadow p-4">
            <table className="w-full text-left">
                <thead className="bg-accent overflow-hidden">
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index}>{col.header}</th>
                        ))}
                        {showActions && <th>ACTIONS</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.length > 0 ? (
                        data.map((item, rowIndex) => (
                            <tr key={rowIndex}>
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex}>
                                        {col.render ? col.render(item, rowIndex) : item[col.accessor]}
                                    </td>
                                ))}
                                {showActions && (
                                    <td>
                                        {canEdit && (
                                            <button
                                                className="edit-btn"
                                                onClick={() => onEdit(item)}
                                            >
                                                ✏️
                                            </button>
                                        )}

                                        {canDelete && (
                                            <button
                                                className="delete-btn"
                                                onClick={() => onDelete(item._id)}
                                            >
                                                🗑
                                            </button>
                                        )}
                                    </td>
                                )}

                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length + 1}>No Data Found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
export default CommonTable;