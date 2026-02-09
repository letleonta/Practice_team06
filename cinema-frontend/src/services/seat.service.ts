import { axiosInstance } from "../api/axiosInstance";
import type { SeatDto, SessionSeatDto} from "../types/seat";

export const SeatService = {
    async getById(id: number) {
        const response = await axiosInstance.get<SeatDto>(`/seats/${id}`);
        return response.data;
    },

    async getAvailableSeats(sessionId: number) {
        const response = await axiosInstance.get<SessionSeatDto[]>(`/seats/available/${sessionId}`);
        return response.data;
    },

    async update(id: number, data: any) {
        const response = await axiosInstance.put<SeatDto>(`/seats/${id}`, data);
        return response.data;
    },

    async delete(id: number) {
        await axiosInstance.delete(`/seats/${id}`);
    },

    async getByHallId(hallId: number) {
        const response = await axiosInstance.get<SeatDto[]>(`/seats/hall/${hallId}`);
        return response.data;
    }
};