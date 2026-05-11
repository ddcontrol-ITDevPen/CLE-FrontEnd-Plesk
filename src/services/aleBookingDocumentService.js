import api from "./api.js";

const BASE_URL = "/aleBookingDocument";

export const getAleBookingDocuments = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}

export const registerAleBookingDocument= async (bookingDocument) => {
    const res = await api.post(`${BASE_URL}/register`, bookingDocument, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    });
    return res.data;
}

export const getAleBookingDocumentById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const updateAleBookingDocument = async (id, bookingDocument) => {
    const res = await api.put(`${BASE_URL}/update/${id}`, bookingDocument, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return res.data;
}

export const deleteAleBookingDocument = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}

export const getAleBookingDocumentByBookingNumber = async (id) => {
    const res = await api.get(`${BASE_URL}/booking/${id}`);
    return res.data;
}
