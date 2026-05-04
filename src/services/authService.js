import api from "./api";

const AUTH_URL = "/auth";

export const login = async (userId, password, region, access) => {
    const response = await api.post(`${AUTH_URL}/login`, {userId, password, companyRegion: region, access});
    return response.data;
};

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
        window.location.href = "/login";
    }
};