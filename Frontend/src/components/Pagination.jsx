function Pagination({page, totalPages, setPages}){
    if(totalPages <= 1){
        return null
    }

    return(
        <div className="mt-4 flex justify-end">
            <button disabled={page === 1} onClick={()=>setPages(page-1)} className="px-4 py-2 border border-slate-200 rounded-lg bg-red-400"
                > {"<"} </button>
            <span className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">{page}/{totalPages}</span>
            <button disabled={page===totalPages} onClick={()=>setPages(page+1)} className="px-4 py-2 border border-slate-200 rounded-lg bg-red-400"
                >{">"}</button>
        </div>
    );
}
export default Pagination;