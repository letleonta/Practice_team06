import api from '../api/axiosInstance';
import type { Language, CreateLanguageDto } from '../types/language';

export const languageService = {
    // Отримати всі мови (підтримує пошук та сортування з твого контролера)
    getAll: async (search?: string, sortBy?: string, isDescending: boolean = false) => {
        const response = await api.get<Language[]>('/languages', {
            params: { search, sortBy, isDescending }
        });
        return response.data;
    },

    // Отримати мову за ID
    getById: async (id: number) => {
        const response = await api.get<Language>(`/languages/${id}`);
        return response.data;
    },

    // Створити нову мову
    create: async (data: CreateLanguageDto) => {
        const response = await api.post<Language>('/languages', data);
        return response.data;
    },

    // Оновити мову
    update: async (id: number, data: CreateLanguageDto) => {
        await api.put(`/languages/${id}`, data);
    },

    // Видалити мову
    delete: async (id: number) => {
        await api.delete(`/languages/${id}`);
    }
};