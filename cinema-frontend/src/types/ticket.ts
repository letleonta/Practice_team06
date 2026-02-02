export interface TicketDto {
    id: number;
    seatId: number;
    actualPrice: number;
    isActive: boolean;
    rowNumber?: number;
    seatNumber?: number;
}

export interface TicketBookingDto {
    id: number;
    userId: number;
    bookingId: number;
    sessionId: number;
    seatId: number;
    actualPrice: number;
    isActive: boolean;
    rowNumber?: number;
    seatNumber?: number;
}

export interface AdminTicketDto extends TicketBookingDto {
    userId: number;
    bookingId: number;
}

export interface CreateTicketDto {
    sessionId: number;
    seatId: number;
}