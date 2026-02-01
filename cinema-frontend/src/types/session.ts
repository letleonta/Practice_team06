export interface SessionDto {
    id: number;
    movieTitle: string;
    hallId: number;
    hallName: string;
    languageName: string;
    startTime: string; // ISO String
    endTime: string;
}

export interface CreateSessionDto {
    movieId: number;
    hallId: number;
    languageId: number;
    startTime: string; // ISO String
}

export interface HallDto {
    id: number;
    name: string;
}

export interface LanguageDto {
    id: number;
    name: string;
}