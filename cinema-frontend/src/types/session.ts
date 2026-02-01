export interface SessionDto {
    id: number;
    movieTitle: string;
    hallId: number;
    hallName: string;
    languageName: string;
    startTime: string;
    endTime: string;
}

export interface CreateSessionDto {
    movieId: number;
    hallId: number;
    languageId: number;
    startTime: string;
}