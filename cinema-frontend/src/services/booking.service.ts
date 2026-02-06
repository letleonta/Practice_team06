import { axiosInstance } from "../api/axiosInstance";
import type {
    BookingDto,
    AdminBookingDto,
    BookingFilterDto, CreateBookingDto, AdminBookingsWithStatsDto
} from "../types/booking";

import type {PagedResult} from "../types/common.ts";

export const BookingService = {
    // --- ДЛЯ АДМІНІСТРАТОРА ---
    async getAllBookings(filter: BookingFilterDto) {
        const params = new URLSearchParams();

        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });
        const response = await axiosInstance.get<AdminBookingsWithStatsDto>("/bookings", {
            params: params
        });
        return response.data;
    },

    async deleteBooking(bookingId: number) {
        await axiosInstance.delete(`/bookings/${bookingId}`);
    },

    // --- ДЛЯ КЛІЄНТА (CUSTOMER) ---
    async getMyBookings(filter: BookingFilterDto) {
        const params = new URLSearchParams();

        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });
        const response = await axiosInstance.get<PagedResult<BookingDto>>("/bookings/my", {
            params: params
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

    async getBookingById(bookingId: number) {
        const response = await axiosInstance.get<AdminBookingDto | BookingDto>(`/bookings/${bookingId}`);
        return response.data;
    }
};