import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useCompany } from "../context/companyContext";

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { selectedCompany } = useCompany();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                let url = `${API_URL}/dashboard`;
                if (selectedCompany && selectedCompany._id !== "all") {
                    url += `?companyId=${selectedCompany._id}`;
                }
                const response = await axios.get(url, { withCredentials: true });
                setData(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching dashboard data", err);
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [selectedCompany]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-purple-600"></div>
        </div>
    );

    if (!data) return <div className="p-10 text-center text-red-500 font-bold">Error loading metrics</div>;

    const projectStats = data.projectStats || [];
    const recentDocuments = data.recentDocuments || [];
    const PIE_COLORS = ['#0ef43c', '#f7b409', '#ff1515'];

    const pieData = [
        { name: 'Low', value: data.lowIssues },
        { name: 'Medium', value: data.midIssues },
        { name: 'High', value: data.highIssues },
    ];

    return (
        <div className="overflow-auto bg-[#f8fafc] p-4 rounded-lg font-sans text-slate-900 flex flex-col">
            {/* HEADER - Compact */}
            <div className="mb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
                {/* Left Side */}
                <div>
                    <h3 className="text-xl font-black tracking-tight text-slate-800 leading-none">
                        Company Overview
                    </h3>
                    <p className="text-slate-500 text-xs font-medium mt-1 uppercase tracking-wider">
                        Metrics for {selectedCompany?.companyName || 'All Companies'}
                    </p>
                </div>

                {/* Right Side */}
                <div className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-purple-200 md:mt-0">
                    {data.projects} ACTIVE PROJECTS
                </div>
            </div>

            {/* STATS - Slimmed down height */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <StatCard title="Staff" value={data.staff} icon="users" color="bg-indigo-600" />
                <StatCard title="Roles" value={data.roles} icon="shield" color="bg-purple-600" />
                <StatCard title="Tasks" value={data.tasks} icon="check" color="bg-blue-600" />
                <StatCard title="Issues" value={data.issues} icon="alert" color="bg-rose-500" />
            </div>

            {/* CHARTS SECTION - Fixed height to prevent scrolling */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 mb-4">

                {/* BAR CHART */}
                <div className="lg:col-span-7 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col w-full">
                    <h5 className="text-[5px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Tasks & Issues Per Project</h5>
                    <div className="w-full h-[250px] ">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={projectStats} barGap={4} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '10px' }} />
                                <Bar dataKey="tasks" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Tasks" barSize={24} />
                                <Bar dataKey="issues" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Issues" barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* PIE CHART */}
                <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center w-full">
                    <h5 className="text-[5px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Issue Distribution</h5>
                    <div className="w-full h-[190px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} dataKey="value" innerRadius="60%" outerRadius="85%" paddingAngle={3}>
                                    {pieData.map((entry, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between w-full mt-2 px-2">
                        {pieData.map((entry, i) => (
                            <div key={i} className="text-center">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">{entry.name}</p>
                                <p className="text-sm font-black text-slate-700">{entry.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* TABLE SECTION - Compact, no scrollbar */}
            <div className=" bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h5 className="text-[5px] font-black uppercase tracking-[0.2em] text-slate-400">Recent Documents</h5>
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                        {data.documents} TOTAL
                    </span>
                </div>
                <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <table className="min-w-full text-left">
                        <thead className="bg-slate-50 sticky top-0">
                            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                <th className="px-6 py-3">Document Name</th>
                                <th className="px-6 py-3">Owner</th>
                                <th className="px-6 py-3 text-center">Created Date</th>
                                {/* hidden on small */}
                                <th className="px-6 py-3 text-center hidden sm:table-cell">Updated Date</th> 
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentDocuments.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-xs text-slate-400">
                                        No Data Available
                                    </td>
                                </tr>
                            ) : (
                                recentDocuments.map((doc, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                        {/* Document Name */}
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-purple-50 rounded text-purple-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <span className="font-bold text-slate-700 text-xs truncate max-w-xs">{doc.name}</span>
                                            </div>
                                        </td>

                                        {/* Owner Name */}
                                        <td className="px-6 py-3 text-slate-600 text-xs font-medium">{doc.ownerId?.name || 'N/A'}</td>

                                        {/* Created Date */}
                                        <td className="px-6 py-3 text-center text-slate-400 text-xs uppercase">{new Date(doc.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>

                                        {/* Updated Date */}
                                        <td className="px-6 py-3 text-center text-slate-400 text-xs uppercase hidden sm:table-cell">{new Date(doc.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color, icon }) => {
    const iconPaths = {
        users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m16-10a4 4 0 11-8 0 4 4 0 018 0z",
        shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
        check: "M5 13l4 4L19 7",
        alert: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    };

    return (
        <div className="bg-white px-5 py-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
            <div className={`${color} p-2.5 rounded-xl text-white shadow-md shadow-slate-200`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={iconPaths[icon]} />
                </svg>
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{title}</p>
                <p className="text-xl font-black text-slate-900 leading-none">{value || 0}</p>
            </div>
        </div>
    );
};

export default Dashboard;