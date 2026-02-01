import { axiosInstance } from "../api/axiosInstance";
import type { SeatDto, SessionSeatDto, UpdateSeatDto } from "../types/seat";

export const SeatService = {
    async getByHall(hallId: number) {
        const response = await axiosInstance.get<SeatDto[]>(`/seats/hall/${hallId}`);
        return response.data;
    },

    async getById(id: number) {
        const response = await axiosInstance.get<SeatDto>(`/seats/${id}`);
        return response.data;
    },

    async getAvailableSeats(sessionId: number) {
        const response = await axiosInstance.get<SessionSeatDto[]>(`/seats/available/${sessionId}`);
        return response.data;
    },

    async update(id: number, data: UpdateSeatDto) {
        const response = await axiosInstance.put<SeatDto>(`/seats/${id}`, data);
        return response.data;
    },

    async delete(id: number) {
        await axiosInstance.delete(`/seats/${id}`);
    }
};