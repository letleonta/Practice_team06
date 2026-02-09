export interface TicketDto {
    id: number;
    movieTitle: string;
    moviePoster: string;
    startTime: string;
    ageRestriction: string;
    actualPrice: number;
    isActive: boolean;
    hallName?: string;
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