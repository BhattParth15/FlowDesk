import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (userData) => {
        // Save to state for real-time UI updates
        setUser(userData);
        setIsLoggedIn(true);
        // Save to localStorage for persistence after refresh
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", userData.token);
    };

    const logout = () => {
        setUser(null);
        localStorage.clear();
        window.location.href = "/";
    };
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}