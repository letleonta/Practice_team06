import type {HallDto} from "./hall.ts";
import type {BaseFilterDto} from "./common.ts";
import type {TicketDto} from "./ticket.ts";

export const BookingStatus = {
    Inprogress: "Inprogress",
    Paid: "Paid",
    Cancelled: "Cancelled",
} as const;

export type GroupByPeriod = 'Hour' | 'Day' | 'Month';
export type SortBy = 'date' | 'status' | 'userEmail' | null;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

export interface BookingDto {
    id: number;
    title: string;
    bookingTime: string;
    status: BookingStatus;
    startTime: string;
    ageRestriction: string;
    posterUri: string;
    ticketsCount: number;
    totalPrice: number;
}

export interface AdminBookingDto extends BookingDto {
    userEmail: string;
}

export interface BookingDetailsDto extends BookingDto {
    pagedTickets: {
        items: TicketDto[];
        totalCount: number;
        page: number;
        pageSize: number;
    };
}

export interface AdminBookingDetailsDto extends BookingDetailsDto {
    userEmail: string;
}

export interface CreateBookingDto {
    sessionId: number;
    seatIds: number[];
}

export interface BookingFilterDto extends BaseFilterDto {
    Status?: BookingStatus;
    UserEmail?: string | null;
    SessionId?: string | number | null;
    BookingFromDate?: string | null;
    BookingToDate?: string | null;
    SessionFromDate?: string | null;
    SessionToDate?: string | null;
    SearchQuery?: string | null;
    GroupBy?: GroupByPeriod;
    SortBy?: SortBy;
    IsDescending?: boolean;
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
    totalTicketsCount: number;
    revenuePoints: RevenuePointDto[];
    hallPoints: HallPointDto[];
    genrePoints: GenrePointDto[];
}