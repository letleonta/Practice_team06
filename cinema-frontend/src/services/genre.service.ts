import { axiosInstance } from "../api/axiosInstance";
import type { GenreDto, CreateGenreDto, GenreFilterDto } from "../types/genre";

import type { PagedResult } from "../types/common";

export const GenreService = {

    async getAll(filter?: GenreFilterDto) {
        const response = await axiosInstance.get<PagedResult<GenreDto>>("/genres", {
            params: filter
        });
        return response.data;
    },

    // Отримати по ID
    async getById(id: number) {
        const response = await axiosInstance.get<GenreDto>(`/genres/${id}`);
        return response.data;
    },

    // Створити новий жанр
    async create(data: CreateGenreDto) {
        const response = await axiosInstance.post<GenreDto>("/genres", data);
        return response.data;
    },

    // Масове створення
    async createBulk(data: CreateGenreDto[]) {
        const response = await axiosInstance.post<GenreDto[]>("/genres/bulk", data);
        return response.data;
    },

    // Оновити назву жанру
    async update(id: number, data: CreateGenreDto) {
        await axiosInstance.put(`/genres/${id}`, data);
    },

    // Видалити жанр
    async delete(id: number) {
        await axiosInstance.delete(`/genres/${id}`);
    }
};