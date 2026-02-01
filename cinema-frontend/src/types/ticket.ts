export interface TicketDto {
    bookingId: number;
    sessionId: number;
    seatId: number;
    actualPrice: number;
    isActive: boolean;
}

export interface TicketBookingDto {
    id: number;
    userId: number;
    bookingId: number;
    sessionId: number;
    seatId: number;
    actualPrice: number;
    isActive: boolean;
}

export interface AdminTicketDto extends TicketBookingDto {
    userId: number;
    bookingId: number;
}

export interface CreateTicketDto {
    sessionId: number;
    seatId: number;
}