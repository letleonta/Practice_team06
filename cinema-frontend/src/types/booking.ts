import type {TicketBookingDto} from "./ticket.ts";
import type {PagedResult} from "./pagedResult.ts";
import type {HallDto} from "./hall.ts";

export const BookingStatus = {
    Inprogress: "Inprogress",
    Paid: "Paid",
    Cancelled: "Cancelled",
} as const;

export type SortBy = 'date' | 'status' | 'userId' | null;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

export interface BookingDto {
    id: number;
    title: string;
    bookingTime: string;
    status: BookingStatus;
    startTime: string;
    ageRestriction: string;
    posterUri: string;
    tickets: TicketBookingDto[];
    totalPrice: number;
}

export interface CreateBookingDto {
    sessionId: number;
    seatIds: number[];
}

export interface AdminBookingDto extends BookingDto {
    userId: number;
}

export interface BookingFilterDto {
    Status?: BookingStatus;
    UserId?: string | number | null;
    SessionId?: string | number | null;
    BookingFromDate?: string | null;
    BookingToDate?: string | null;
    SessionFromDate?: string | null;
    SessionToDate?: string | null;
    SearchQuery?: string | null;
    SortBy?: SortBy;
    IsDescending?: boolean;
    Page?: number;
    PageSize?: number;
}

export interface RevenuePointDto {
    date: string;
    amount: number;
}

export interface HallPointDto {
    hall: HallDto,
    number: number;
}

export interface GenrePointDto {
    genre: string;
    number: number;
}

export interface BookingsStatsDto {
    totalCount: number;
    inProgressCount: number;
    paidCount: number;
    cancelledCount: number;
    totalRevenue: number;
    revenuePoints: RevenuePointDto[];
    hallPoints: HallPointDto[];
    genrePoints: GenrePointDto[];
}
export interface AdminBookingsWithStatsDto {
    bookingsPage: PagedResult<AdminBookingDto>;
    stats : BookingsStatsDto;
}