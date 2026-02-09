import { axiosInstance } from "../api/axiosInstance";
import type {
    TicketDto,
    AdminTicketDto
} from "../types/ticket";

export const TicketService = {

    async getById(ticketId: number) {
        const response = await axiosInstance.get<AdminTicketDto | TicketDto>(`/tickets/${ticketId}`);
        return response.data;
    },

    async refund(ticketId: number) {
        const response = await axiosInstance.put(`/tickets/${ticketId}/refund`, ticketId);
        return response.data;
    },

    // Видалити квиток (Тільки адмін)
    async delete(ticketId: number) {
        await axiosInstance.delete(`/tickets/${ticketId}`);
    }
};