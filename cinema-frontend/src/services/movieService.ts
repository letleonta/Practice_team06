import api from '../api/axiosInstance';
import type { Movie, CreateMovieDto } from '../types/movie';

export const movieService = {
    // Отримати всі фільми
    getAll: async () => {
        const response = await api.get<Movie[]>('/movies');
        return response.data;
    },

    // Отримати один фільм за ID
    getById: async (id: number) => {
        const response = await api.get<Movie>(`/movies/${id}`);
        return response.data;
    },

    // Створити фільм
    create: async (data: CreateMovieDto) => {
        const response = await api.post('/movies', data);
        return response.data;
    },

    // Оновити фільм
    update: async (id: number, data: CreateMovieDto) => {
        const response = await api.put(`/movies/${id}`, data);
        return response.data;
    },

    // Видалити фільм
    delete: async (id: number) => {
        await api.delete(`/movies/${id}`);
    }
};