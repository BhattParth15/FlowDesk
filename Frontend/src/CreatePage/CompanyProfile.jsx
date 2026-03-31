import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

function CompanyProfile() {
    const [company, setCompany] = useState(null);
    const [plans, setPlans] = useState([]);
    const [activeTab, setActiveTab] = useState("PROFILE");
    const { user } = useContext(AuthContext);

    const [timing, setTiming] = useState({
        openingTime: "",
        closingTime: "",
        breakStart: "",
        breakEnd: "",
        holidays: []
    });
    const [holidayInput, setHolidayInput] = useState({ date: "", title: "" });

    useEffect(() => {
        fetchCompany();
        fetchPlans();
    }, []);
    useEffect(() => {
        if (user?.role?.name === "CompanyOwner") {
            setActiveTab("SUBSCRIPTION");
        }
    }, [user]);

    useEffect(() => {
        if (company?.timing) {
            setTiming({
                openingTime: company.timing.openingTime || "",
                closingTime: company.timing.closingTime || "",
                breakStart: company.timing.breakStart || "",
                breakEnd: company.timing.breakEnd || "",
                holidays: company.timing.holidays || []
            });
        }
    }, [company]);

    const fetchCompany = async () => {
        const res = await axios.get(`${API_URL}/company/my`, { withCredentials: true });
        setCompany(res.data);
    };

    const fetchPlans = async () => {
        const res = await axios.get(`${API_URL}/subcription/all`, { withCredentials: true });
        setPlans(res.data);
    };

    const handleUpdate = (field, value) => {
        setCompany({ ...company, [field]: value });
    };
    const saveTiming = async () => {
        try {
            await axios.post(`${API_URL}/company/timing`, {
                openingTime: timing.openingTime,
                closingTime: timing.closingTime,
                breakStart: timing.breakStart,
                breakEnd: timing.breakEnd,
                holidays: timing.holidays
            }, { withCredentials: true });

        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };

    const activatePlan = async (planId) => {
        await axios.post(`${API_URL}/subcription/apply`, {
            companyId: company._id,
            planId
        }, { withCredentials: true });

        fetchCompany();
    };

    if (!company) return <div className="p-10 text-center font-bold">Loading...</div>;

    return (
        <div className="p-8 bg-gray-100 min-h-screen">

            {/* ================= TABS ================= */}
            <div className="max-w-5xl mx-auto mb-6 flex gap-8 text-md font-semibold text-gray-400">
                <button onClick={() => setActiveTab("PROFILE")}
                    className={activeTab === "PROFILE" ? "text-blue-600 border-b-2 border-blue-600 pb-2" : ""}>
                    Company Profile
                </button>

                <button onClick={() => setActiveTab("TIMING")}
                    className={activeTab === "TIMING" ? "text-blue-600 border-b-2 border-blue-600 pb-2" : ""}>
                    Company Timing
                </button>

                <button onClick={() => setActiveTab("SUBSCRIPTION")}
                    className={activeTab === "SUBSCRIPTION" ? "text-blue-600 border-b-2 border-blue-600 pb-2" : ""}>
                    Subscription
                </button>
            </div>

            <div className="w-full mx-auto">
                {/* ================= PROFILE ================= */}
                {activeTab === "PROFILE" && (
                    <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">

                        <h3 className="text-md font-semibold mb-4 text-[#1b2559]">
                            Company Details
                        </h3>

                        {/* Company Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 rounded-lg">
                                <p className="text-gray-400 text-xs">Company Name</p>
                                <p className="font-medium text-sm">{company.companyName}</p>
                            </div>

                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 rounded-lg">
                                <p className="text-gray-400 text-xs">Company Email</p>
                                <p className="font-medium text-sm">{company.companyEmail}</p>
                            </div>

                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 rounded-lg">
                                <p className="text-gray-400 text-xs">Phone</p>
                                <p className="font-medium text-sm">{company.phone}</p>
                            </div>

                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 rounded-lg">
                                <p className="text-gray-400 text-xs">Address</p>
                                <p className="font-medium text-sm truncate">{company.companyAddress}</p>
                            </div>

                        </div>

                        {/* Divider */}
                        <hr className="my-4 border-gray-200" />

                        {/* Owner Info */}
                        <h3 className="text-md font-semibold mb-4 text-[#1b2559]">
                            Owner Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 rounded-lg">
                                <p className="text-gray-400 text-xs">Owner Name</p>
                                <p className="font-medium text-sm">{company.ownerName}</p>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 rounded-lg">
                                <p className="text-gray-400 text-xs">Owner Email</p>
                                <p className="font-medium text-sm truncate">{company.ownerEmail}</p>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 rounded-lg">
                                <p className="text-gray-400 text-xs">Owner Phone</p>
                                <p className="font-medium text-sm">{company.ownerPhone}</p>
                            </div>

                        </div>

                    </div>
                )}
                {/* ================= TIMING ================= */}
                {activeTab === "TIMING" && (
                    <div className="bg-white p-8 rounded-2xl shadow border border-gray-100 space-y-8">
                        <div>
                            <h4 className="text-md font-semibold mb-4 text-gray-700">
                                Working Hours
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                                    <p className="text-gray-400 text-xs">Opening Time</p>
                                    <input
                                        type="time"
                                        value={timing.openingTime}
                                        onChange={(e) => setTiming({ ...timing, openingTime: e.target.value })}
                                        className="bg-transparent font-semibold text-sm outline-none w-full mt-1"
                                    />
                                </div>
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                                    <p className="text-gray-400 text-xs">Closing Time</p>
                                    <input
                                        type="time"
                                        value={timing.closingTime}
                                        onChange={(e) => setTiming({ ...timing, closingTime: e.target.value })}
                                        className="bg-transparent font-semibold text-sm outline-none w-full mt-1"
                                    />
                                </div>

                            </div>
                        </div>
                        <div>
                            <h4 className="text-md font-semibold mb-4 text-gray-700">
                                Break Time
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
                                    <p className="text-gray-400 text-xs">Break Start</p>
                                    <input
                                        type="time"
                                        value={timing.breakStart}
                                        onChange={(e) => setTiming({ ...timing, breakStart: e.target.value })}
                                        className="bg-transparent font-semibold text-sm outline-none w-full mt-1"
                                    />
                                </div>
                                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
                                    <p className="text-gray-400 text-xs">Break End</p>
                                    <input
                                        type="time"
                                        value={timing.breakEnd}
                                        onChange={(e) => setTiming({ ...timing, breakEnd: e.target.value })}
                                        className="bg-transparent font-semibold text-sm outline-none w-full mt-1"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-md font-semibold mb-4 text-gray-700">
                                Holidays
                            </h4>
                            <div className="flex gap-3 mb-4">
                                <input
                                    type="date"
                                    value={holidayInput.date}
                                    onChange={(e) => setHolidayInput({ ...holidayInput, date: e.target.value })}
                                    className="border p-2 rounded w-[160px]"
                                />

                                <input
                                    type="text"
                                    placeholder="Holiday Title"
                                    value={holidayInput.title}
                                    onChange={(e) => setHolidayInput({ ...holidayInput, title: e.target.value })}
                                    className="border p-2 rounded flex-1"
                                />

                                <button
                                    onClick={() => {
                                        if (!holidayInput.date || !holidayInput.title) return;

                                        setTiming({
                                            ...timing,
                                            holidays: [...(timing.holidays || []), holidayInput]
                                        });

                                        setHolidayInput({ date: "", title: "" });
                                    }}
                                    className="bg-blue-600 text-white px-5 rounded-lg"
                                >
                                    Add
                                </button>
                            </div>

                            {/* Holiday List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {(timing.holidays || []).map((h, i) => (
                                    <div
                                        key={i}
                                        className="bg-gradient-to-r from-red-50 to-red-100 px-4 py-3 rounded-lg flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="text-gray-400 text-xs">Holiday</p>
                                            <p className="font-medium text-sm">
                                                {h.title} ({new Date(h.date).toLocaleDateString()})
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => {
                                                const updated = timing.holidays.filter((_, idx) => idx !== i);
                                                setTiming({ ...timing, holidays: updated });
                                            }}
                                            className="text-red-500 font-bold text-lg"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ================= SAVE BUTTON ================= */}
                        <div className="pt-4">
                            <button
                                onClick={saveTiming}
                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold"
                            >
                                Save Timing
                            </button>
                        </div>

                    </div>
                )}
                {activeTab === "SUBSCRIPTION" && (
                    <div className="space-y-10 animate-fadeIn">
                        {/* ================= CURRENT PLAN ================= */}
                        <div className="bg-white shadow-md border border-gray-100 w-full rounded-2xl overflow-hidden transition-all hover:shadow-xl">

                            {company.subscription?.planId ? (
                                <div className="flex flex-col md:flex-row items-center">
                                    {/* ================= LEFT : ACTIVE PLAN ================= */}
                                    <div className="md:w-[220px] w-full bg-gradient-to-r from-blue-50 to-blue-100 px-5 py-4">
                                        <p className="text-[10px] font-bold text-[#422afb] uppercase tracking-wider">
                                            Active Plan
                                        </p>
                                        <p className="text-lg font-black text-[#1b2559] leading-tight">
                                            {company.subscription.planId.planName}
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                            Valid To:
                                            <span className="text-gray-800 font-semibold ml-1">
                                                {new Date(company.subscription.endDate).toLocaleDateString()}
                                            </span>
                                        </p>
                                    </div>
                                    {/* ================= RIGHT : USAGE ================= */}
                                    <div className="flex-1 px-5 py-4 flex items-center justify-between flex-wrap gap-6">
                                        {company.subscription.planId.modules?.map((m, i) => {
                                            const used = company.usage?.[m.moduleName] || 0;
                                            return (
                                                <div key={i} className="flex flex-col items-center min-w-[70px]">
                                                    {/* MODULE NAME */}
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                                        {m.moduleName}
                                                    </span>

                                                    {/* VALUE BELOW */}
                                                    <span className="text-lg font-black text-[#1b2559] leading-tight">
                                                        {used}
                                                        <span className="text-gray-300 text-sm ml-1">
                                                            /{m.limit}
                                                        </span>
                                                    </span>

                                                </div>
                                            );
                                        })}

                                    </div>

                                </div>
                            ) : (
                                <p className="text-center text-gray-400 font-semibold py-6">
                                    No active subscription
                                </p>
                            )}

                        </div>

                        {/* ================= PLAN GRID ================= */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {plans.map(plan => {
                                const isActive = company.subscription?.planId?._id === plan._id;
                                return (
                                    <div
                                        key={plan._id}
                                        className={`group flex flex-col bg-white p-7 rounded-[30px] border transition-all duration-300 relative overflow-hidden
                        
                                            ${isActive
                                                ? "border-[#422afb] shadow-2xl scale-[1.05] ring-2 ring-[#422afb]/20"
                                                : "border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02]"
                                            }`}
                                    >
                                        {/* Glow Effect */}
                                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300
                                            ${!isActive && "bg-gradient-to-br from-blue-50 via-transparent to-purple-50"}`}
                                        />
                                        {/* HEADER */}
                                        <div className="mb-2 relative z-10">
                                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">
                                                {plan.price > 5000 ? "ENTERPRISE" : "PROFESSIONAL"}
                                            </p>
                                            <h3 className="text-xl font-black text-[#1b2559]">
                                                {plan.planName}
                                            </h3>
                                        </div>
                                        {/* PRICE */}
                                        <div className="mb-1 relative z-10">
                                            <span className="text-3xl font-black text-[#422afb]">
                                                ${plan.price}
                                            </span>
                                            <span className="text-gray-400 text-xs ml-1 uppercase font-bold">
                                                /{plan.billingCycle}
                                            </span>
                                        </div>
                                        {/* FEATURES */}
                                        <div className="flex-grow space-y-3 mb-8 border-t border-gray-50 pt-6 relative z-10">
                                            {plan.modules.map((m, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <div className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-50">
                                                        <span className="text-[#422afb] text-[10px] font-bold leading-none">✓</span>
                                                    </div>
                                                    <span className="text-[12px] font-semibold text-gray-600 leading-none flex items-center group-hover:text-[#1b2559] transition">
                                                        {m.limit} {m.moduleName}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* BUTTON */}
                                        <button
                                            disabled={isActive}
                                            onClick={() => activatePlan(plan._id)}
                                            className={`relative z-10 w-full py-2 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300
                                                    ${isActive
                                                    ? "bg-gray-300 text-gray-400 cursor-default "
                                                    : "bg-[#422afb] text-white hover:bg-[#3311db] hover:shadow-xl hover:shadow-blue-200 active:scale-95"
                                                }`}
                                        >
                                            {isActive ? "Active Plan" : "Choose Plan"}
                                        </button>

                                        {/* CURRENT PLAN TAG */}
                                        {isActive && (
                                            <div className="absolute top-4 right-4 bg-[#422afb] text-white text-[9px] px-3 py-1 rounded-full font-bold shadow">
                                                CURRENT
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default CompanyProfile;