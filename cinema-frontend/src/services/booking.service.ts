import { axiosInstance } from "../api/axiosInstance";
import type {
    BookingDto,
    AdminBookingDto,
    BookingFilterDto
} from "../types/booking";

export const BookingService = {
    // --- ДЛЯ АДМІНІСТРАТОРА ---
    async getAllBookings(filter?: BookingFilterDto) {
        const response = await axiosInstance.get<AdminBookingDto[]>("/bookings", {
            params: filter
        });
        return response.data;
    },

    async deleteBooking(bookingId: number) {
        await axiosInstance.delete(`/bookings/${bookingId}`);
    },

    // --- ДЛЯ КЛІЄНТА (CUSTOMER) ---
    async getMyBookings() {
        const response = await axiosInstance.get<BookingDto[]>("/bookings/my");
        return response.data;
    },

    async createBooking() {
        // У тебе в контролері PostBooking не приймає тіло (бере userId з токена)
        const response = await axiosInstance.post<BookingDto>("/bookings");
        return response.data;
    },

    async cancelBooking(bookingId: number) {
        await axiosInstance.put(`/bookings/${bookingId}/cancel`);
    },

    async confirmBooking(bookingId: number) {
        await axiosInstance.put(`/bookings/${bookingId}/confirm`);
    },

    // --- СПІЛЬНЕ ---
    async getBookingById(bookingId: number) {
        // Бекенд сам вирішить по ролі, що повернути
        const response = await axiosInstance.get<AdminBookingDto | BookingDto>(`/bookings/${bookingId}`);
        return response.data;
    }
};