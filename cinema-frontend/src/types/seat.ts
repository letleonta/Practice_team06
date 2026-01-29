// src/types/seat.ts
export interface SessionSeatDto {
    seatId: number;
    rowNumber: number;
    seatNumber: number;
    type: 'Standard' | 'VIP'; // Твій Enum прийде текстом
    isAvailable: boolean;
    price: number | null;
}