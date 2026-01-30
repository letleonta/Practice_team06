export interface Movie {
    id: number;
    title: string;
    description?: string;
    durationMin?: number;
    releaseDate?: string; // DateOnly приходить як рядок "YYYY-MM-DD"
    basePrice: number;
    rating?: number;
    posterUri?: string;
    ageRestriction: string;
    startDate?: string;
    endDate?: string;
    directorName: string;
    genres: string[];
    actors: string[];
}
export interface CreateMovieDto {
    title: string;
    description: string;
    durationMin: number;
    releaseDate: string; // Формат "YYYY-MM-DD"
    basePrice: number;
    startDate?: string;
    endDate?: string;
    posterUri?: string;
    trailerUri?: string;
    ageRestriction: number; // Або рядок, залежно від того, як приходить Enum з беку
    directorId?: number;
    genreIds: number[];
    actorIds: number[];
}