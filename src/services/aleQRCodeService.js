import api from "./api.js";

const BASE_URL = "/aleQRCode";

export const getAleQRCodes = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}

export const getAleQRCodeById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const generateAleQRCode = async (qrCode) => {
    const res = await api.post(`${BASE_URL}/generate-qr`, qrCode);
    return res.data;
}

export const verifyAleQRCode = async (qrCode) => {
    const res = await api.post(`${BASE_URL}/verify-qr`, qrCode);
    return res.data;
}

export const deleteAleQRCode = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}

export const getALeQRCodeScanHistories = async (id) => {
    const res = await api.get(`${BASE_URL}/scan-history`);
    return res.data;
}