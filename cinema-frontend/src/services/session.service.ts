import { axiosInstance } from "../api/axiosInstance";
import type { SessionDto, CreateSessionDto, SessionFilterDto } from "../types/session";
import type { PagedResult } from "../types/common";

export const SessionService = {
    // [GET] АДМІНКА: Отримати всі сеанси з пагінацією та фільтрами
    async getAll(filter: SessionFilterDto) {
        const response = await axiosInstance.get<PagedResult<SessionDto>>("/sessions", {
            params: filter
        });
        return response.data;
    },

    // [GET] КЛІЄНТ: Отримати майбутні сеанси для конкретного фільму (список)
    async getByMovieId(movieId: number, filter: SessionFilterDto) {
        const response = await axiosInstance.get<PagedResult<SessionDto>>(`/sessions/by-movie/${movieId}`, {
            params: filter
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