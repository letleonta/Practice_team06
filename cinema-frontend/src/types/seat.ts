import { SeatType } from "./hall"; // Використовуємо вже створений enum

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