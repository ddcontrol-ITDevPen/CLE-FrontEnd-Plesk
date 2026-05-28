import api from "./api.js";

const BASE_URL = "/aleContainer";

export const getAleContainers = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}

export const registerAleContainer= async (container) => {
    const res = await api.post(`${BASE_URL}/register`, container);
    return res.data;
}

export const getAleContainerById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const updateAleContainer = async (id, container) => {
    const res = await api.put(`${BASE_URL}/update/${id}`, container);
    return res.data;
}

export const deleteAleContainer = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}

export const getAllAleContainersByForwarding = async (id) => {
    const res = await api.get(`${BASE_URL}/all/forwarding/${id}`);
    return res.data;
}

export const getAllAleContainersByHaulier = async (id) => {
    const res = await api.get(`${BASE_URL}/all/haulier/${id}`);
    return res.data;
}

export const getAllAleContainersByBookingAgent = async (id) => {
    const res = await api.get(`${BASE_URL}/all/bookingAgent/${id}`);
    return res.data;
}

export const getAllAleContainersByConsignee = async (id) => {
    const res = await api.get(`${BASE_URL}/all/consignee/${id}`);
    return res.data;
}

export const getContainersForAKPSAction = async (id) => {
    const res = await api.get(`${BASE_URL}/action/akps`);
    return res.data;
}

export const getContainersForCustomAction = async (id) => {
    const res = await api.get(`${BASE_URL}/action/custom`);
    return res.data;
}

export const getContainersForTerminalAction = async (id) => {
    const res = await api.get(`${BASE_URL}/action/terminal`);
    return res.data;
}