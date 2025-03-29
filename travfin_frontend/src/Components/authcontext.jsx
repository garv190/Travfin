import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch("http://localhost:3500/getmyprofile", { credentials: "include" })
            .then(res => res.json())
            .then(data => { if (data.success) setUser(data.user); });
    }, []);

    const login = async (email, password) => {
        const res = await fetch("http://localhost:3500/signin", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) setUser(data.user);
    };

    const logout = () => {
        fetch("http://localhost:3500/logout", { method: "POST", credentials: "include" })
            .then(() => setUser(null));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
