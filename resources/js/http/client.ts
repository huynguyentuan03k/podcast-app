import axios, { AxiosInstance } from 'axios';

function csrfToken() {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
}

class Http {
    instance: AxiosInstance;

    constructor() {
        this.instance = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
            timeout: 10000,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });

        this.instance.interceptors.request.use((config) => {
            const token = csrfToken();

            if (token) {
                config.headers['X-CSRF-TOKEN'] = token;
            }

            return config;
        });
    }
}

const http = new Http().instance;

export default http;
