import api from "./api.js";

const BASE_URL = "/containerAddress";

export const getContainerAddresses = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}

export const registerContainerAddress = async (containerAddress) => {
    const res = await api.post(`${BASE_URL}/register`, containerAddress);
    return res.data;
}

export const getContainerAddressById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const updateContainerAddress = async (id, containerAddress) => {
    const res = await api.put(`${BASE_URL}/update/${id}`, containerAddress);
    return res.data;
}

export const deleteContainerAddress = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}