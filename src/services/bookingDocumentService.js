import api from "./api.js";

const BASE_URL = "/bookingDocument";

export const getBookingDocuments = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}

export const registerBookingDocument= async (bookingDocument) => {
    const res = await api.post(`${BASE_URL}/register`, bookingDocument, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    });
    return res.data;
}

export const getBookingDocumentById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const updateBookingDocument = async (id, bookingDocument) => {
    const res = await api.put(`${BASE_URL}/update/${id}`, bookingDocument, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return res.data;
}

export const deleteBookingDocument = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}

export const getBookingDocumentByBookingNumber = async (id) => {
    const res = await api.get(`${BASE_URL}/booking/${id}`);
    return res.data;
}
