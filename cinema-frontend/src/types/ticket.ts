export interface TicketDto {
    id: number;
    seatId: number;
    actualPrice: number;
    isActive: boolean;
    rowNumber?: number;
    seatNumber?: number;
}