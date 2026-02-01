export const SeatType = {
    Standard: 0,
    VIP: 1,
} as const;

export type SeatType = typeof SeatType[keyof typeof SeatType];

export interface SeatDto {
    id: number;
    hallId: number;
    rowNumber: number;
    seatNumber: number;
    priceModifier: number;
    seatType: SeatType;
}

export interface SessionSeatDto {
    seatId: number;
    rowNumber: number;
    seatNumber: number;
    type: SeatType;
    isAvailable: boolean;
    price: number; // decimal -> number
}

export interface UpdateSeatDto {
    seatType: SeatType;
    priceModifier: number;
}