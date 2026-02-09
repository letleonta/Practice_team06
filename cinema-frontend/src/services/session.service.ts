import { axiosInstance } from "../api/axiosInstance";
import type { SessionDto, CreateSessionDto } from "../types/session";

export const SessionService = {
    async getByMovieId(movieId: number, date?: string) {
        const response = await axiosInstance.get<SessionDto[]>(`/sessions/by-movie/${movieId}`, {
            params: { date } // Відправляє ?date=YYYY-MM-DD
        });
        return response.data;
    },

    // Деталі конкретного сеансу
    async getById(id: number) {
        const response = await axiosInstance.get<SessionDto>(`/sessions/${id}`);
        return response.data;
    },

    // Створити сеанс (Адмін)
    async create(data: CreateSessionDto) {
        // Тут важливо обробити помилку overlap, яку кидає бек
        const response = await axiosInstance.post<SessionDto>("/sessions", data);
        return response.data;
    },

    // Оновити сеанс (Адмін)
    async update(id: number, data: CreateSessionDto) {
        const response = await axiosInstance.put<SessionDto>(`/sessions/${id}`, data);
        return response.data;
    },

    // Видалити сеанс (Адмін)
    async delete(id: number) {
        await axiosInstance.delete(`/sessions/${id}`);
    }
};