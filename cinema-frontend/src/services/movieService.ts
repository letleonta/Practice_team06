import api from '../api/axiosInstance';
import type { Movie, CreateMovieDto } from '../types/movie';

export const movieService = {
    getAll: async () => {
        const response = await api.get<Movie[]>('/movies');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<Movie>(`/movies/${id}`);
        return response.data;
    },

    create: async (data: CreateMovieDto) => {
        const response = await api.post('/movies', data);
        return response.data;
    },

    update: async (id: number, data: CreateMovieDto) => {
        const response = await api.put(`/movies/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/movies/${id}`);
    }
};