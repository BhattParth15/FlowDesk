import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;


const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
    const [selectedCompany, setSelectedCompany] = useState({ _id: "all", name: "All", companyIds: [] });
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const fetchCompany = async () => {
        try {
            const res = await axios.get(`${API_URL}/company/my`, {withCredentials: true});
            const newPlan = res.data?.subscription?.planId;
            // update only if plan changed
            if (company?.subscription?.planId !== newPlan) {
                setCompany(res.data);
            }
            //setCompany(res.data);
        } catch (err) {
            setCompany(null);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchCompany();
    }, []);
    // GLOBAL HELPER FUNCTION
    const hasModule = (moduleName) => {
        return company?.subscription?.modules?.some(
            (m) => m.name === moduleName
        );
    };
    return (
        <CompanyContext.Provider value={{ selectedCompany, setSelectedCompany, company, hasModule, loading }}>
            {children}
        </CompanyContext.Provider>
    );
}
export const useCompany = () => useContext(CompanyContext);