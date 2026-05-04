import api from "./api.js";

const BASE_URL = "/company";

export const getCompanies = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}

export const registerCompany = async (company) => {
    const res = await api.post(`${BASE_URL}/register`, company);
    return res.data;
}

export const getCompanyById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const updateCompany = async (id, company) => {
    const res = await api.put(`${BASE_URL}/update/${id}`, company);
    return res.data;
}

export const deleteCompany = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}