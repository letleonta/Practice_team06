import api from '../api/axiosInstance';
import type { HallDto, CreateHallDto, GenerateFlexibleSeatsDto } from '../types/hall';

export const hallService = {
    getAll: async () => {
        const response = await api.get<HallDto[]>('/halls');
        return response.data;
    },
    create: async (data: CreateHallDto) => {
        const response = await api.post<HallDto>('/halls', data);
        return response.data;
    },
    generateFlexibleSeats: async (data: GenerateFlexibleSeatsDto) => {
        const response = await api.post('/halls/generate-flexible-seats', data);
        return response.data;
    },

    delete: async (id: number) => {
        return await api.delete(`/halls/${id}`);
    }
};