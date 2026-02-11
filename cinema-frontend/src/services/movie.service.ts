import { axiosInstance } from "../api/axiosInstance";
import type {MovieDto, CreateMovieDto, MovieFilterDto} from "../types/movie";

import type {PagedResult} from "../types/common.ts";

export const MovieService = {
    // Отримати всі фільми
    async getAll(filter : MovieFilterDto) {
        const response = await axiosInstance.get<PagedResult<MovieDto>>("/movies", {
            params : filter,
        });
        return response.data;
    },

    // Отримати деталі одного фільму
    async getById(id: number) {
        const response = await axiosInstance.get<MovieDto>(`/movies/${id}`);
        return response.data;
    },

    // Фільми, що скоро вийдуть
    async getUpcoming(filter : MovieFilterDto) {
        const response = await axiosInstance.get<PagedResult<MovieDto>>("/movies/upcoming", {
            params : filter
        });
        return response.data;
    },

    // Фільми, що зараз у прокаті (найважливіше для головної сторінки)
    async getNowPlaying(filter : MovieFilterDto) {
        const response = await axiosInstance.get<PagedResult<MovieDto>>("/movies/now-playing",{
            params: filter,
            paramsSerializer: {
                indexes: null
            }
        });
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
        try {
            await axiosInstance.delete(`/movies/${id}`);
        } catch (error: any) {
            // Прокидуємо повідомлення з бекенду, якщо воно є
            throw new Error(error.response?.data?.message || "Помилка видалення");
        }
    },

    async getRecommendations(count: number = 6): Promise<MovieDto[]> {
        const response = await axiosInstance.get<MovieDto[]>(`/movies/recommendations`, {
            params: { count }
        });
        return response.data;
    }
};