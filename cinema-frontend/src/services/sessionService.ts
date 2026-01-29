
// src/services/sessionService.ts
import type {SessionDto} from "../types/session";

const API_URL = "http://localhost:5144/api/Sessions"; // Перевір порт Rider!

export const sessionService = {
    // Отримати всі сеанси для конкретного фільму
    async getByMovieId(movieId: number): Promise<SessionDto[]> {
        const response = await fetch(`${API_URL}/by-movie/${movieId}`);
        if (!response.ok) return [];
        return await response.json();
    }
};