export interface AdminTicketDto {
    id: number;
    userId: number;
    bookingId: number;
    sessionId: number;
    seatId: number;
    actualPrice: number;
    isActive: boolean;
}

export interface CreateTicketDto {
    sessionId: number;
    seatId: number;
}