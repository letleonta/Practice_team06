import { axiosInstance } from "../api/axiosInstance";
import type {
    DirectorDto,
    DirectorFilterDto,
    DirectorMovieDto,
    CreateDirectorDto
} from "../types/director";

export const DirectorService = {
    // Отримати список з фільтрацією
    async getAll(filter?: DirectorFilterDto) {
        const response = await axiosInstance.get<DirectorDto[]>("/directors", {
            params: filter
        });
        return response.data;
    },

    // Отримати по ID
    async getById(id: number) {
        const response = await axiosInstance.get<DirectorDto>(`/directors/${id}`);
        return response.data;
    },

    // Отримати фільми режисера
    async getDirectorMovies(id: number) {
        const response = await axiosInstance.get<DirectorMovieDto[]>(`/directors/${id}/movies`);
        return response.data;
    },

    // Створити режисера
    async create(data: CreateDirectorDto) {
        const response = await axiosInstance.post<DirectorDto>("/directors", data);
        return response.data;
    },

    // Масове створення (bulk)
    async createBulk(data: CreateDirectorDto[]) {
        const response = await axiosInstance.post<DirectorDto[]>("/directors/bulk", data);
        return response.data;
    },

    // Оновити дані
    async update(id: number, data: CreateDirectorDto) {
        await axiosInstance.put(`/directors/${id}`, data);
    },

    // Видалити режисера
    async delete(id: number) {
        await axiosInstance.delete(`/directors/${id}`);
    }
};