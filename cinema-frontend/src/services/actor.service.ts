import { axiosInstance } from "../api/axiosInstance";
import type {
    ActorDto,
    ActorFilterDto,
    ActorMovieDto,
    CreateActorDto
} from "../types/actor";

export const ActorService = {
    async getAll(filter?: ActorFilterDto) {
        const response = await axiosInstance.get<ActorDto[]>("/actors", {
            params: filter // Axios сам додасть їх до URL
        });
        return response.data;
    },

    async getById(id: number) {
        const response = await axiosInstance.get<ActorDto>(`/actors/${id}`);
        return response.data;
    },

    async getActorMovies(id: number) {
        const response = await axiosInstance.get<ActorMovieDto[]>(`/actors/${id}/movies`);
        return response.data;
    },

    async create(data: CreateActorDto) {
        const response = await axiosInstance.post<ActorDto>("/actors", data);
        return response.data;
    },

    async createBulk(data: CreateActorDto[]) {
        const response = await axiosInstance.post<ActorDto[]>("/actors/bulk", data);
        return response.data;
    },

    async update(id: number, data: CreateActorDto) {
        await axiosInstance.put(`/actors/${id}`, data);
    },

    async delete(id: number) {
        await axiosInstance.delete(`/actors/${id}`);
    }
};