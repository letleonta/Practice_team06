import { axiosInstance } from "../api/axiosInstance";
import type { LanguageDto, CreateLanguageDto, LanguageFilterDto } from "../types/language";
import type {PagedResult} from "../types/common.ts";

export const LanguageService = {
    async getAll(filter: LanguageFilterDto) {
        const response = await axiosInstance.get<PagedResult<LanguageDto>>("/languages", {
            params: filter
        });
        return response.data;
    },

    async getById(id: number) {
        const response = await axiosInstance.get<LanguageDto>(`/languages/${id}`);
        return response.data;
    },

    async create(data: CreateLanguageDto) {
        const response = await axiosInstance.post<LanguageDto>("/languages", data);
        return response.data;
    },

    async update(id: number, data: CreateLanguageDto) {
        await axiosInstance.put(`/languages/${id}`, data);
    },

    async delete(id: number) {
        await axiosInstance.delete(`/languages/${id}`);
    }
};