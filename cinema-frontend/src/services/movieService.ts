// src/services/movieService.ts
import type {MovieDto, CreateMovieDto} from "../types/movie";

const API_URL = "http://localhost:5144/api/Movies"; // Перевір свій порт!

export const movieService = {
    // Отримати всі фільми
    async getAll(): Promise<MovieDto[]> {
        const response = await fetch(API_URL);
        return await response.json();
    },

    // Отримати фільми, що зараз у кіно
    async getNowPlaying(): Promise<MovieDto[]> {
        const response = await fetch(`${API_URL}/now-playing`);
        return await response.json();
    },

    // Отримати очікувані новинки
    async getUpcoming(): Promise<MovieDto[]> {
        const response = await fetch(`${API_URL}/upcoming`);
        return await response.json();
    },

    // Деталі одного фільму
    async getById(id: number): Promise<MovieDto> {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error("Фільм не знайдено");
        return await response.json();
    },

    // Створити фільм (Адмін)
    async create(dto: CreateMovieDto): Promise<MovieDto> {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });
        return await response.json();
    }
};