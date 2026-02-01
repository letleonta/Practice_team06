import type {SeatType} from "./seat.ts";


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
    totalSeats?: number;
}

export interface RowConfigDto {
    rowNumber: number;
    seatCount: number;
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