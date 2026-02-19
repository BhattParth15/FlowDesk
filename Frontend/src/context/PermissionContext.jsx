import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:9824/auth/me", {withCredentials: true,})
    .then(res => {
      setPermissions(res.data.permissions || []);
      setLoading(false);
    })
    .catch(() => {
      setPermissions([]);
      setLoading(false);
    });
  }, []);

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
