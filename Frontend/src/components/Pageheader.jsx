import { usePermission } from "../context/PermissionContext";

function PageHeader({ title, onCreate, createPermission }) {
    const { hasPermission } = usePermission();
    return (
        <nav className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-800">{title}</h2>
            {createPermission && hasPermission(createPermission) && (
                <button
                    className="btn-primary"
                    onClick={onCreate}
                >
                    Create
                </button>
            )}
        </nav>

    );
}
export default PageHeader;