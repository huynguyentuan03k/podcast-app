import axios from 'axios';

const http = axios.create({
    baseURL: '/api',
    headers: {
        Accept: 'application/json',
    },
});

http.interceptors.request.use((config) => {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;

    if (token) {
        config.headers['X-CSRF-TOKEN'] = token;
    }

    return config;
});

export default http;
