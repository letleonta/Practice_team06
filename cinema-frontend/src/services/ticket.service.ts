import { axiosInstance } from "../api/axiosInstance";
import type {
    TicketDto,
    AdminTicketDto,
    TicketBookingDto,
    CreateTicketDto
} from "../types/ticket";

export const TicketService = {
    // Отримати квитки (для адміна — всі, для юзера — за ID бронювання)
    async getTickets(bookingId?: number) {
        const response = await axiosInstance.get<AdminTicketDto[] | TicketBookingDto[]>("/tickets", {
            params: { bookingId }
        });
        return response.data;
    },

    async getById(ticketId: number) {
        const response = await axiosInstance.get<AdminTicketDto | TicketDto>(`/tickets/${ticketId}`);
        return response.data;
    },

    // Створити квиток (Додати до кошика/бронювання)
    async create(bookingId: number, data: CreateTicketDto) {
        // bookingId йде в URL як ?bookingId=5, data йде в тілі запиту
        const response = await axiosInstance.post<TicketDto>(`/tickets`, data, {
            params: { bookingId }
        });
        return response.data;
    },

    // Видалити квиток (Тільки адмін)
    async delete(ticketId: number) {
        await axiosInstance.delete(`/tickets/${ticketId}`);
    }
};