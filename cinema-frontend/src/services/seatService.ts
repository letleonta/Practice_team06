// src/services/seatService.ts
// src/services/seatService.ts
import type {SessionSeatDto} from "../types/seat";

const API_URL = "http://localhost:5144/api/Seats"; // Твій порт Rider

export const seatService = {
    async getAvailableSeats(sessionId: number): Promise<SessionSeatDto[]> {
        const response = await fetch(`${API_URL}/available/${sessionId}`);
        if (!response.ok) return [];
        return await response.json();
    }
};