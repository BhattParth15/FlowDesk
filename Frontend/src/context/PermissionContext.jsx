import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { data } from "react-router-dom";
import { AuthContext } from "./AuthContext";
const API_URL = import.meta.env.VITE_API_URL;

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user,isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    if (!user && !isLoggedIn) {
      setPermissions([]);
      setLoading(false);
      return;
    }
    axios.get(`${API_URL}/auth/me`, { withCredentials: true })
      .then(res => {
        setPermissions(res.data.permissions || []);
        setLoading(false);
      })
      .catch(() => {
        setPermissions([]);
        setLoading(false);
      });
  }, [user,isLoggedIn]);
  const hasPermission = (P) => {
    if (permissions.includes("ALL")) return true;
    return permissions.includes(P);
  };

  return (
    <PermissionContext.Provider value={{ hasPermission, loading }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => useContext(PermissionContext);
