export interface Movie {
    id: number;
    title: string;
    description?: string;
    durationMin?: number;
    releaseDate?: string;
    basePrice: number;
    rating?: number;
    posterUri?: string;
    ageRestriction: string;
    startDate?: string;
    endDate?: string;
    directorName: string;
    genres: string[];
    actors: string[];
    languageIds: number[];
}
export interface CreateMovieDto {
    title: string;
    description: string;
    durationMin: number;
    releaseDate: string;
    basePrice: number;
    startDate?: string;
    endDate?: string;
    posterUri?: string;
    trailerUri?: string;
    languageIds: number[];
    ageRestriction: number;
    directorId?: number;
    genreIds: number[];
    actorIds: number[];
    rating?: number;
}