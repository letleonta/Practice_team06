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

export interface SeatDto {
    id: number;
    hallId: number;
    rowNumber: number;
    seatNumber: number;
    priceModifier: number;
    seatType: SeatType;
}

export interface AddRowDto {
    rowNumber: number;
    seatCount: number;
    type: number;
}