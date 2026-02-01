export interface SessionDto {
    id: number;
    movieTitle: string;
    hallId: number;
    hallName: string;
    languageName: string;
    startTime: string;
    endTime: string;
}

export interface SessionSeatDto {
    seatId: number;
    rowNumber: number;
    seatNumber: number;
    type: string;
    isAvailable: boolean;
    price: number;
}