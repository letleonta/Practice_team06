import api from '../api/axiosInstance';
import type { SeatDto } from '../types/seat';

export const seatService = {
    getByHallId: async (hallId: number) => {
        const response = await api.get<SeatDto[]>(`/seats/hall/${hallId}`);
        return response.data;
    },

    updateSeat: async (id: number, data: { seatType: number, priceModifier: number }) => {
        const response = await api.put(`/seats/${id}`, data);
        return response.data;
    }
};