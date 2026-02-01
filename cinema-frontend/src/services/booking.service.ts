import { axiosInstance } from "../api/axiosInstance";
import type {
    BookingDto,
    AdminBookingDto,
    BookingFilterDto, CreateBookingDto
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
    async getMyBookings(filter?: BookingFilterDto) {
        const response = await axiosInstance.get<BookingDto[]>("/bookings/my", {
            params: filter
        });
        return response.data;
    },

    async createBooking(data: CreateBookingDto) {
        const response = await axiosInstance.post<BookingDto>("/bookings", data);
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
        const response = await axiosInstance.get<AdminBookingDto | BookingDto>(`/bookings/${bookingId}`);
        return response.data;
    }
};