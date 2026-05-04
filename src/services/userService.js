import api from "./api.js";

const BASE_URL = "/user";

export const getUsers = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}

export const registerUser= async (user) => {
    const res = await api.post(`${BASE_URL}/register`, user);
    return res.data;
}

export const getUserById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const updateUser = async (id, user) => {
    const res = await api.put(`${BASE_URL}/update/${id}`, user);
    return res.data;
}

export const deleteUser = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}