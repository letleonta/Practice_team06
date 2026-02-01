import api from '../api/axiosInstance';
import type {CreateSessionDto, SessionDto, HallDto, LanguageDto} from '../types/session';

export const sessionService = {
    // Отримати сеанси конкретного фільму
    getByMovie: async (movieId: number) => {
        const response = await api.get<SessionDto[]>(`/sessions/by-movie/${movieId}`);
        return response.data;
    },

    create: async (data: CreateSessionDto) => {
        return await api.post('/sessions', data);
    },

    delete: async (id: number) => {
        await api.delete(`/sessions/${id}`);
    },

    // Допоміжні методи для залів і мов (якщо немає окремих сервісів)
    getHalls: async () => {
        const response = await api.get<HallDto[]>('/halls');
        return response.data;
    },
    getLanguages: async () => {
        const response = await api.get<LanguageDto[]>('/languages'); // Припускаю, що такий контролер є
        return response.data;
    }
};