import { axiosInstance } from "../api/axiosInstance";
import type {
    BookingDto,
    AdminBookingDto,
    BookingFilterDto, CreateBookingDto, BookingsStatsDto, BookingDetailsDto, AdminBookingDetailsDto
} from "../types/booking";

import type {BaseFilterDto, PagedResult} from "../types/common.ts";

export const BookingService = {
    async getAllBookings(filter: BookingFilterDto) {
        const params = new URLSearchParams();

        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });
        const response = await axiosInstance.get<PagedResult<AdminBookingDto>>("/bookings", {
            params: params
        });
        return response.data;
    },

    async deleteBooking(bookingId: number) {
        await axiosInstance.delete(`/bookings/${bookingId}`);
    },

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

    async getStats(filter: BookingFilterDto): Promise<BookingsStatsDto> {
        const response = await axiosInstance.get<BookingsStatsDto>('/bookings/stats', { params: filter });
        return response.data;
    },

    async createBooking(data: CreateBookingDto) {
        const response = await axiosInstance.post<BookingDto>("/bookings", data);
        return response.data;
    },

    async cancelBooking(bookingId: number) {
        await axiosInstance.put(`/bookings/${bookingId}/cancel`);
    },

    //TODO: чому
    async confirmBooking(bookingId: number) {
        await axiosInstance.put(`/bookings/${bookingId}/confirm`);
    },

    async getBookingById(bookingId: number, filter: BaseFilterDto) {
        const response = await axiosInstance.get<BookingDetailsDto | AdminBookingDetailsDto>(
            `/bookings/${bookingId}`,
            { params: filter }
        );
        return response.data;
    }
};