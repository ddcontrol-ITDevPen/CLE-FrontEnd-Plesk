import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5006/api";
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor: This will now successfully grab the token saved by authService.js!
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("userToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Handles global 401s
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !error.config.url.includes("auth/login")) {
            localStorage.clear();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;