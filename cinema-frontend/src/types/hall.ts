export interface CreateHallDto {
    name: string;
    // PriceModifier, Description - поки не використовуємо, але бекенд їх може чекати
    priceModifier?: number;
    description?: string;
}

// Відповідає HallDto з C#
export interface HallDto {
    id: number;
    name: string;
    priceModifier: number;
    description?: string;
    totalSeats?: number;
}

export interface GenerateStandardSeatsDto {
    hallId: number;
    rowCount: number;
    seatsPerRow: number;
    type: number;
}

export interface RowConfigDto {
    rowNumber: number;
    seatCount: number;
    type: number; // 0 - Standard, 1 - VIP
}

export interface GenerateFlexibleSeatsDto {
    hallId: number;
    rows: RowConfigDto[];
}