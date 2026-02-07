import { axiosInstance } from "../api/axiosInstance";
import type {
    DirectorDto,
    DirectorFilterDto,
    DirectorMovieDto,
    CreateDirectorDto
} from "../types/director";

import type {BaseFilterDto, PagedResult} from "../types/common.ts";

export const DirectorService = {
    async getAll(filter: DirectorFilterDto) {
        const response = await axiosInstance.get<PagedResult<DirectorDto>>("/directors", {
            params: filter
        });
        return response.data;
    },

    async getById(id: number) {
        const response = await axiosInstance.get<DirectorDto>(`/directors/${id}`);
        return response.data;
    },

    async getDirectorMovies(id: number, filter: BaseFilterDto): Promise<PagedResult<DirectorMovieDto>> {
        const response = await axiosInstance.get(`/directors/${id}/movies`, { params: filter });
        return response.data;
    },

    async create(data: CreateDirectorDto) {
        const response = await axiosInstance.post<DirectorDto>("/directors", data);
        return response.data;
    },

    async createBulk(data: CreateDirectorDto[]) {
        const response = await axiosInstance.post<DirectorDto[]>("/directors/bulk", data);
        return response.data;
    },

    async update(id: number, data: CreateDirectorDto) {
        await axiosInstance.put(`/directors/${id}`, data);
    },

    async delete(id: number) {
        await axiosInstance.delete(`/directors/${id}`);
    }
};