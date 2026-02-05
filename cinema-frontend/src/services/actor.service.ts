import { axiosInstance } from "../api/axiosInstance";
import type {
    ActorDto,
    ActorFilterDto,
    ActorMovieDto,
    CreateActorDto
} from "../types/actor";
import type {PagedResult} from "../types/pagedResult";

export const ActorService = {
    async getAll(filter: ActorFilterDto): Promise<PagedResult<ActorDto>> {
        const response = await axiosInstance.get<PagedResult<ActorDto>>("/actors", {
            params: filter
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