import type {TicketDto} from "./ticket.ts";

export interface BookingDto {
    id: number;
    title: string;
    bookingTime: string;
    startTime: string;
    ageRestriction: string;
    posterUri: string;
    status: string;
    tickets: TicketDto[];
    totalPrice: number;
}

export interface CreateBookingDto {
    sessionId: number;
    seatIds: number[];
}

export interface AdminBookingDto extends BookingDto {
    userId?: number;
}

export type BookingStatus = 'Inprogress' | 'Cancelled' | 'Paid' | null;
export type SortBy = 'date' | 'status' | 'userId' | null;

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
