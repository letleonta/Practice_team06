export const SeatType = {
    Standard: 0,
    VIP: 1,
    LoveSeats: 2
} as const;

export type SeatType = typeof SeatType[keyof typeof SeatType];

export interface HallDto {
    id: number;
    name: string;
    priceModifier: number;
    description?: string;
}

export interface CreateHallDto {
    name: string;
    priceModifier: number;
    description?: string;
}

export interface RowConfigDto {
    rowNumber: number;
    seatCount: number;
    type: SeatType;
}

export interface GenerateStandardSeatsDto {
    hallId: number;
    rowCount: number;
    seatsPerRow: number;
    type: SeatType;
}

export interface GenerateFlexibleSeatsDto {
    hallId: number;
    rows: RowConfigDto[];
}

export interface SeatDto {
    id: number;
    hallId: number;
    rowNumber: number;
    seatNumber: number;
    priceModifier: number;
    seatType: SeatType;
}