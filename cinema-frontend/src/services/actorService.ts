import api from '../api/axiosInstance';
import type {CreateActorDto, ActorDto} from '../types/actor';

export const actorService = {
    getAll: async () => {
        const response = await api.get<ActorDto[]>('/actors');
        return response.data;
    },

    create: async (data: CreateActorDto) => {
        const response = await api.post<ActorDto>('/actors', data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/actors/${id}`);
    }
};