import api from '../api/axiosInstance';
import type { AdminTicketDto } from '../types/ticket';

export const ticketService = {
    getAll: async () => {
        const response = await api.get<AdminTicketDto[]>('/tickets');
        return response.data;
    },

    delete: async (ticketId: number) => {
        await api.delete(`/tickets/${ticketId}`);
    }
};