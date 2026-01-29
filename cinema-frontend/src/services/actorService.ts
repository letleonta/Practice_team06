// src/services/actorService.ts
import type { ActorDto, CreateActorDto, ActorMovieDto, ActorFilterDto } from "../types/actor";

const API_URL = "http://localhost:5144/api/Actors"; // Перевір свій порт у Rider!

export const actorService = {
    // 1. Отримати всіх акторів (з підтримкою пошуку та сортування)
    async getAll(filter?: ActorFilterDto): Promise<ActorDto[]> {
        const params = new URLSearchParams();
        if (filter?.search) params.append("Search", filter.search);
        if (filter?.sortBy) params.append("SortBy", filter.sortBy);
        if (filter?.isDescending !== undefined) params.append("IsDescending", String(filter.isDescending));

        const response = await fetch(`${API_URL}?${params.toString()}`);
        if (!response.ok) throw new Error("Не вдалося завантажити список акторів");
        return await response.json();
    },

    // 2. Отримати одного актора за ID
    async getById(id: number): Promise<ActorDto> {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error("Актора не знайдено");
        return await response.json();
    },

    // 3. Створити нового актора
    async create(dto: CreateActorDto): Promise<ActorDto> {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });
        if (!response.ok) throw new Error("Помилка при створенні актора");
        return await response.json();
    },

    // 4. Масове створення акторів (Bulk)
    async createBulk(dtos: CreateActorDto[]): Promise<ActorDto[]> {
        const response = await fetch(`${API_URL}/bulk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dtos)
        });
        if (!response.ok) throw new Error("Помилка при масовому створенні");
        return await response.json();
    },

    // 5. Отримати список фільмів, у яких грав цей актор
    async getActorMovies(id: number): Promise<ActorMovieDto[]> {
        const response = await fetch(`${API_URL}/${id}/movies`);
        if (!response.ok) throw new Error("Не вдалося завантажити фільми актора");
        return await response.json();
    },

    // 6. Оновити дані актора
    async update(id: number, dto: CreateActorDto): Promise<void> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });
        if (!response.ok) throw new Error("Не вдалося оновити дані");
    },

    // 7. Видалити актора
    async delete(id: number): Promise<void> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });
        if (!response.ok) throw new Error("Не вдалося видалити актора");
    }
};