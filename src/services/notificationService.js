import api from "./api.js";

const BASE_URL = "/notification";

export const getUnreadNotifications = async (userId) => {
    const res = await api.get(`${BASE_URL}/unread/${userId}`);
    return res.data;
}

export const markNotificationAsRead = async (id) => {
    const res = await api.post(`${BASE_URL}/read/${id}`);
    return res.data;
}