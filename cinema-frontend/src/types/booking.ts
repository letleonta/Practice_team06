export const BookingStatus = {
    Inprogress: 0,
    Paid: 1,
    Cancelled: 2
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

export interface TicketBookingDto {
    id: number;
    sessionId: number;
    seatId: number;
    actualPrice: number;
    isActive: boolean;
}

export interface BookingDto {
    id: number;
    bookingTime: string;
    status: BookingStatus;
    totalPrice: number;
    tickets: TicketBookingDto[];
}

export interface AdminBookingDto extends BookingDto {
    userId: number;
}

export interface BookingFilterDto {
    status?: BookingStatus;
    fromDate?: string;
    toDate?: string;
    userId?: number;
    sessionId?: number;
    sortBy?: 'date' | 'status' | 'user' | 'session';
    isDescending?: boolean;
}