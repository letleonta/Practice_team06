import { axiosInstance } from "../api/axiosInstance";
import type {
    HallDto,
    CreateHallDto,
    GenerateFlexibleSeatsDto,
    SeatDto
} from "../types/hall";

export const HallService = {
    // Отримати всі зали
    async getAll() {
        const response = await axiosInstance.get<HallDto[]>("/halls");
        return response.data;
    },

    // Отримати зал за ID
    async getById(id: number) {
        const response = await axiosInstance.get<HallDto>(`/halls/${id}`);
        return response.data;
    },

    // Отримати всі крісла конкретного залу
    async getHallSeats(hallId: number) {
        const response = await axiosInstance.get<SeatDto[]>(`/halls/${hallId}/seats`);
        return response.data;
    },

    // Створити зал
    async create(data: CreateHallDto) {
        const response = await axiosInstance.post<HallDto>("/halls", data);
        return response.data;
    },

    // Видалити зал
    async delete(id: number) {
        await axiosInstance.delete(`/halls/${id}`);
    },

    async generateFlexibleSeats(data: GenerateFlexibleSeatsDto) {
        const response = await axiosInstance.post<{ message: string }>("/halls/generate-flexible-seats", data);
        return response.data;
    }
};