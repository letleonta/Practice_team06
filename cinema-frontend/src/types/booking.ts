import type {TicketBookingDto} from "./ticket.ts";

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
    SortBy?: SortBy;
    IsDescending?: boolean;
}