// src/types/movie.ts

export interface MovieDto {
    id: number;
    title: string;
    description: string | null;
    durationMin: number | null;
    releaseDate: string | null; // Дати в JSON приходять як string
    basePrice: number;
    rating: number | null;
    posterUri: string | null;
    ageRestriction: string;
    directorName: string;
    genres: string[];
    actors: string[];
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
    ageRestriction: number; // Тут надсилаємо число (0, 1, 2...)
    directorId?: number;
    genreIds: number[];
    actorIds: number[];
}