import api from '../api/axiosInstance';
import type {CreateDirectorDto, DirectorDto} from '../types/director';

export const directorService = {
    getAll: async () => {
        const response = await api.get<DirectorDto[]>('/directors');
        return response.data;
    },

    create: async (data: CreateDirectorDto) => {
        const response = await api.post<DirectorDto>('/directors', data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/directors/${id}`);
    }
};