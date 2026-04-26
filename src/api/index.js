import axios from "axios";

const $host = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});
export const $authHost = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});
$host.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.warn('Токен не найден');
    }
    return config;
});
$host.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            alert('Токен истек или невалиден, пожалуйста перезайдите снова');
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
export { $host };