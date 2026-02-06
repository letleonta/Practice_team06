import type {BaseFilterDto} from "./common.ts";

export interface DirectorDto {
    id: number;
    firstName: string;
    lastName: string;
    photoUri?: string;
}

export interface DirectorFilterDto extends BaseFilterDto {
    search?: string;
    sortBy?: 'id' | 'firstname' | 'lastname';
    isDescending?: boolean;
}

export interface DirectorMovieDto {
    movieId: number;
    title: string;
    releaseDate?: string;
}

export interface CreateDirectorDto {
    firstName: string;
    lastName: string;
    photoUri?: string;
}