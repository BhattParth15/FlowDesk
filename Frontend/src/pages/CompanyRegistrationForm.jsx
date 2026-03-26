import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function CompanyRegister() {
    const navigate = useNavigate();
    // const [formData, setFormData] = useState({
    //     companyName: "",
    //     GSTNumber: "",
    //     companyEmail: "",
    //     phone: "",
    //     companyAddress: "",
    //     companyType: "",
    //     ownerName: "",
    //     ownerEmail: "",
    //     ownerPhone: "",
    //     password: "",
    //     status: "Active"
    // });
    const [formData, setFormData] = useState(() => {
        const savedDraft = sessionStorage.getItem("companyRegisterDraft");

        return savedDraft
            ? JSON.parse(savedDraft)
            : {
                companyName: "",
                GSTNumber: "",
                companyEmail: "",
                phone: "",
                companyAddress: "",
                companyType: "",
                ownerName: "",
                ownerEmail: "",
                ownerPhone: "",
                password: "",
                status: ""
            };
    });
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1);
    const location = useLocation();
    const companyData = location.state;
    const { id } = useParams();
    const isEdit = Boolean(id);

    const showMessage = (msg, type = "error") => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(""), 3000);
    };

    useEffect(() => {
        if (!isEdit) {
            sessionStorage.setItem("companyRegisterDraft", JSON.stringify(formData));
        }
    }, [formData, isEdit]);

    useEffect(() => {
        if (isEdit && companyData) {
            setFormData(companyData);
        }
    }, [isEdit, companyData]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const registerCompany = async () => {
        const { companyName, GSTNumber, companyEmail, phone, companyAddress, ownerName, ownerEmail, ownerPhone, password } = formData;
        if (!companyName.trim()) {
            showMessage("Company name required");
            return;
        }
        if (!GSTNumber.trim()) {
            showMessage("GST number required");
            return;
        }
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

        if (!gstRegex.test(GSTNumber)) {
            showMessage("Invalid GST Number");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(companyEmail)) {
            showMessage("Invalid company email");
            return;
        }
        if (!/^\d{10}$/.test(phone)) {
            showMessage("Phone must be 10 digits");
            return;
        }
        if (!companyAddress.trim()) {
            showMessage("Company address required");
            return;
        }
        if (!ownerName.trim()) {
            showMessage("Owner name required");
            return;
        }
        if (!emailRegex.test(ownerEmail)) {
            showMessage("Invalid owner email");
            return;
        }
        if (!/^\d{10}$/.test(ownerPhone)) {
            showMessage("Owner phone must be 10 digits");
            return;
        }
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{10,}$/;

        if (!passwordRegex.test(password)) {
            showMessage("Password must be at least 10 characters and include 1 number and 1 special character");
            return;
        }
        if (!formData.companyType) {
            showMessage("Please select company type");
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/company`, formData, { withCredentials: true });
            showMessage(res.data.message || "Company Registered Successfully and Email Send To company Owner", "success");
            sessionStorage.removeItem("companyRegisterDraft");
            setTimeout(() => {
                navigate("/");
            }, 4000);
        }
        catch (error) {
            console.log(error);
            console.log(error.response);
            showMessage(error.response?.data?.message || "Registration Failed");
        }
    };

    const updateCompany = async () => {
        try {
            const res = await axios.put(`${API_URL}/company/${id}`, formData, { withCredentials: true });
            //showMessage(res.data.message || "Company Updated Successfully", "success");
            sessionStorage.removeItem("companyRegisterDraft");
            setTimeout(() => {
                navigate("/company");
            }, 3000);
        } catch (error) {
            showMessage(error.response?.data?.message || "Update Failed");
        }
    };

    return (
        <div className={`fixed inset-0 flex items-center justify-center p-4 backdrop-blur-sm 
                ${!isEdit ? "bg-gray-100" : "bg-black/60 z-[999]"}`}>
            {/* Message */}
            {message && (
                <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-20 py-3 rounded shadow-lg text-white z-[9999]
                        ${messageType === "error" ? "bg-red-400" : "bg-green-400"}`}>
                    {message}
                </div>
            )}

           <div className={`bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-8 relative 
                            max-h-[90vh] overflow-y-auto ${isEdit ? "mt-2" : ""}`}>
                {/* Changed text color to blue */}
                <h3 className="text-2xl font-bold text-blue-600 mb-6 border-b pb-4">
                    {isEdit ? "Update Company" : "Register Company"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">

                    {/* STEP 1: Company Data */}
                    {(step === 1 || isEdit) && (
                        <>
                            <div className="flex flex-col gap-1">
                                <label className="font-semibold">Company Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    placeholder="Enter Company Name"
                                    onChange={handleChange}
                                    className="border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-semibold">GST Number <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="GSTNumber"
                                    value={formData.GSTNumber}
                                    placeholder="Ex: 22ABCDE1234F1Z5"
                                    maxLength="15"
                                    onChange={(e) => setFormData({ ...formData, GSTNumber: e.target.value.toUpperCase() })}
                                    className="border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-semibold">Company Email <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    name="companyEmail"
                                    value={formData.companyEmail}
                                    placeholder="Enter Company Email"
                                    onChange={handleChange}
                                    className="border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-semibold">Phone <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    placeholder="Enter Phone"
                                    onChange={handleChange}
                                    className="border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1 md:col-span-2">
                                <label className="font-semibold">Address <span className="text-red-500">*</span></label>
                                <textarea
                                    name="companyAddress"
                                    rows={2}
                                    value={formData.companyAddress}
                                    placeholder="Enter Company's Address"
                                    onChange={handleChange}
                                    className="border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-semibold">Company Type <span className="text-red-500">*</span></label>
                                <select
                                    name="companyType"
                                    value={formData.companyType}
                                    onChange={handleChange}
                                    className="border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-400 outline-none">
                                    <option value="">Select Company Type</option>
                                    <option value="IT Services">IT Services</option>
                                    <option value="Software Development">Software Development</option>
                                    <option value="Consulting">Consulting</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                    <option value="Finance / Banking">Finance / Banking</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="E-commerce">E-commerce</option>
                                    <option value="Logistics / Transportation">Logistics / Transportation</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="font-semibold">Company Status <span className="text-red-500">*</span></label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-400 outline-none">
                                    <option value="">Select Company Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Deleted">Deleted</option>
                                </select>
                            </div>
                        </>
                    )}

                    {/* STEP 2: Owner Data */}
                    {(step === 2 || isEdit) && (
                        <>
                            <div className="flex flex-col gap-1">
                                <label className="font-semibold">Owner Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="ownerName"
                                    value={formData.ownerName}
                                    placeholder="Owner Name"
                                    onChange={handleChange}
                                    className="border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-semibold">Owner Email <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    name="ownerEmail"
                                    value={formData.ownerEmail}
                                    placeholder="Owner Email"
                                    onChange={handleChange}
                                    className="border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-semibold">Owner Phone <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="ownerPhone"
                                    value={formData.ownerPhone}
                                    placeholder="Owner Phone"
                                    onChange={handleChange}
                                    className="border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                            </div>

                            {!isEdit && (
                                <div className="flex flex-col gap-1">
                                    <label className="font-semibold">Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            placeholder="Enter Password"
                                            onChange={handleChange}
                                            className="border px-4 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-400 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-3 flex items-center pr-4 text-gray-500 hover:text-gray-700">
                                            {showPassword ? "🔒" : "👁"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-4 mt-8 pt-4 border-t">

                    {/* Back / Cancel Logic */}
                    {step === 1 ? (
                        <button onClick={() => navigate(-1)} className="px-5 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50">
                            Cancel
                        </button>
                    ) : (
                        <button onClick={() => setStep(1)} className="px-5 py-2 border border-gray-500 text-gray-500 rounded-lg hover:bg-gray-50">
                            Back
                        </button>
                    )}

                    {/* Next / Register Logic */}
                    {!isEdit && step === 1 ? (
                        <button onClick={() => setStep(2)} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Next
                        </button>
                    ) : (
                        <button onClick={isEdit ? updateCompany : registerCompany} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            {isEdit ? "Update Company" : "Register Company"}
                        </button>
                    )}

                </div>

            </div>
        </div>
    );
}
export default CompanyRegister;