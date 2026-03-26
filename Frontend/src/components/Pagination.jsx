function Pagination({ page, totalPages, setPages }) {
    if (totalPages <= 1) {
        return null
    }

    return (
        <div className="mt-6 flex justify-end items-center gap-3">

            <button
                disabled={page === 1}
                onClick={() => setPages(page - 1)}
                className="
            px-4 py-2 rounded-lg
            bg-indigo-600 text-white
            hover:bg-indigo-700
            disabled:bg-indigo-300
            disabled:cursor-not-allowed
            transition duration-200
        "
            >
                {"<"}
            </button>

            <span className="text-sm font-medium text-slate-700">
                Page <span className="text-indigo-600 font-semibold">{page}</span> of {totalPages}
            </span>

            <button
                disabled={page === totalPages}
                onClick={() => setPages(page + 1)}
                className="
            px-4 py-2 rounded-lg
            bg-indigo-600 text-white
            hover:bg-indigo-700
            disabled:bg-indigo-300
            disabled:cursor-not-allowed
            transition duration-200
        "
            >
                {">"}
            </button>

        </div>
    );
}
export default Pagination;