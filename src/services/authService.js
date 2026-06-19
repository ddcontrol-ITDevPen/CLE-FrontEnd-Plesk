import api from "./api";
import {useNavigate} from "react-router-dom";

const AUTH_URL = "/auth";

export const login = async (userId, password, region, access) => {
    const response = await api.post(`${AUTH_URL}/login`, { userId, password, region, access });

    // 🔥 CRITICAL FIX: Save the token and user info to localStorage on success
    if (response.data && response.data.token) {
        localStorage.setItem("userToken", response.data.token);
        localStorage.setItem("userId", response.data.userId);
        localStorage.setItem("userName", response.data.fullName);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("companyName", response.data.companyName);
    }

    return response.data;
};

const navigate = useNavigate();

export const logout = async () => {
    try {
        await api.post(`${AUTH_URL}/logout`);
    } catch (err) {
        console.error("Logout request failed", err);
    } finally {
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("role");
        localStorage.removeItem("companyName");
        localStorage.clear();
        navigate("/login");
    }
};


export const resetPassword = async (userId, emailAddress, password) => {
    const response = await api.post(`${AUTH_URL}/forgot-password`, { userId, emailAddress, password });
    return response.data;
};