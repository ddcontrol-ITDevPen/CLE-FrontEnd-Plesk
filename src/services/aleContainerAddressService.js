import api from "./api.js";

const BASE_URL = "/aleContainerAddress";

export const getAleContainerAddresses = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}

export const registerAleContainerAddress = async (containerAddress) => {
    const res = await api.post(`${BASE_URL}/register`, containerAddress);
    return res.data;
}

export const getAleContainerAddressById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const updateAleContainerAddress = async (id, containerAddress) => {
    const res = await api.put(`${BASE_URL}/update/${id}`, containerAddress);
    return res.data;
}

export const deleteAleContainerAddress = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}