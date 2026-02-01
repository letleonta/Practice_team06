import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:5144/api', // Переконайся, що порт правильний
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Можна додати очищення стану стору тут, якщо потрібно
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;