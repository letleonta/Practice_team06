import { axiosInstance } from "../api/axiosInstance";
import type { MovieDto, CreateMovieDto } from "../types/movie";

export const MovieService = {
    // Отримати всі фільми
    async getAll() {
        const response = await axiosInstance.get<MovieDto[]>("/movies");
        return response.data;
    },

    // Отримати деталі одного фільму
    async getById(id: number) {
        const response = await axiosInstance.get<MovieDto>(`/movies/${id}`);
        return response.data;
    },

    // Фільми, що скоро вийдуть
    async getUpcoming() {
        const response = await axiosInstance.get<MovieDto[]>("/movies/upcoming");
        return response.data;
    },

    // Фільми, що зараз у прокаті (найважливіше для головної сторінки)
    async getNowPlaying() {
        const response = await axiosInstance.get<MovieDto[]>("/movies/now-playing");
        return response.data;
    },

    async create(data: CreateMovieDto) {
        const response = await axiosInstance.post<MovieDto>("/movies", data);
        return response.data;
    },

    async update(id: number, data: CreateMovieDto) {
        const response = await axiosInstance.put<MovieDto>(`/movies/${id}`, data);
        return response.data;
    },

    async delete(id: number) {
        await axiosInstance.delete(`/movies/${id}`);
    }
};