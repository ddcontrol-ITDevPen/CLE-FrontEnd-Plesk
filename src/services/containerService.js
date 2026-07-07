import api from "./api.js";

const BASE_URL = "/container";

export const getContainers = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}

export const registerContainer= async (container) => {
    const res = await api.post(`${BASE_URL}/register`, container);
    return res.data;
}

export const getContainerById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const updateContainer = async (id, container) => {
    const res = await api.put(`${BASE_URL}/update/${id}`, container);
    return res.data;
}

export const deleteContainer = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}

export const getAllContainersByForwarding = async (id) => {
    const res = await api.get(`${BASE_URL}/all/forwarding/${id}`);
    return res.data;
}

export const getAllContainersByHaulier = async (id) => {
    const res = await api.get(`${BASE_URL}/all/haulier/${id}`);
    return res.data;
}
export const getAllContainersByDepot = async (id) => {
    const res = await api.get(`${BASE_URL}/all/depot/${id}`);
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
export const getAllContainersByConsignee = async (id) => {
    const res = await api.get(`${BASE_URL}/all/consignee/${id}`);
    return res.data;
}
export const updateContainerToEnroute = async (id, data) => {
    // data contains { enrouteTime, updatedBy }
    // Uses 'api' to preserve auth tokens and matching conventions
    const response = await api.patch(`${BASE_URL}/update-enroute/${id}`, data);
    return response.data;
}
export const updateContainerDepotStatus = async (id, data) => {
    // data contains: { status, containerNumber, rejectedRemarks, updatedBy }
    const response = await api.patch(`${BASE_URL}/update-depot-status/${id}`, data);
    return response.data;
}
export const updateContainerDepotGateIn = async (id, data) => {
    // data contains: { status, containerNumber, rejectedRemarks, updatedBy }
    const response = await api.patch(`${BASE_URL}/update-depot-gatein/${id}`, data);
    return response.data;
}
export const updateContainerDepotGateOut = async (id, data) => {
    // data contains: { containerNumber, sealNumber, updatedBy }
    const response = await api.patch(`${BASE_URL}/update-depot-gateout/${id}`, data);
    return response.data;
}
export const updateContainerConsigneeDelivered = async (id, data) => {
    // data contains: { status, containerNumber, rejectedRemarks, updatedBy }
    const response = await api.patch(`${BASE_URL}/update-consignee-delivered/${id}`, data);
    return response.data;
}
export const updateContainerConsigneeRfc = async (id, data) => {
    // data contains: { status, containerNumber, rejectedRemarks, updatedBy }
    const response = await api.patch(`${BASE_URL}/update-consignee-rfc/${id}`, data);
    return response.data;
}