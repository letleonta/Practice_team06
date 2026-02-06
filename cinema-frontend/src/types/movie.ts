import type {DirectorDto} from "./director.ts";
import type {ActorDto} from "./actor.ts";
import type {GenreDto} from "./genre.ts";

export interface MovieDto {
    id: number;
    title: string;
    description?: string;
    durationMin?: number;
    releaseDate?: string;
    basePrice: number;
    rating?: number;
    trailerUri?: string;
    posterUri?: string;
    ageRestriction: string;
    startDate?: string;
    endDate?: string;
    director?: DirectorDto;
    actors: ActorDto[];
    genres: GenreDto[]
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

export const AgeRestriction = {
    ZeroPlus: 0,
    TwelvePlus: 1,
    SixteenPlus: 2,
    EighteenPlus: 3
} as const;

export type AgeRestrictionType = typeof AgeRestriction[keyof typeof AgeRestriction];

export interface MovieFilterDto {
    title?: string;
    rating?: number;
    ageRestrictions?: AgeRestrictionType[];
    genres?: string[];
}