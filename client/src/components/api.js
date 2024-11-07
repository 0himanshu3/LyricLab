import axios from 'axios';

const api = axios.create({
    baseURL: "/api/auth/",
    // withCredentials: true,
});

export const googleAuth = (code) => api.post(`/google?code=${code}`);