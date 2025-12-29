//konfiguracja biblioteki axios - do wysyłania żądań do backendu

import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3005/api', // adres backendu
    headers: {
        'Content-Type': 'application/json',
    },
});

// interceptor - zanim zapytanie pójdzie, sprawdzamy czy jest token.
// na podstawie tokena odbywa się dostęp do zasobów

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if(token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
        },
    (error) => {
        return Promise.reject(error);
    }
)

export default api;
