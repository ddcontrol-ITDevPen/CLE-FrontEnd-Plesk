import axios from "axios";

//const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5006/api";
const BASE_URL = "/api";

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor: Attach token if decide to use JWT later
// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem("userToken");
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// Response interceptor: Global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !error.config.url.includes("auth/login")) {
            //localStorage.clear();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;