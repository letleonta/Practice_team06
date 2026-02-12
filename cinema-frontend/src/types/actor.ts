import type {BaseFilterDto} from "./common.ts";

export interface ActorDto {
    id: number;
    firstName: string;
    lastName: string;
    photoUri?: string;
}

export interface ActorFilterDto extends BaseFilterDto {
    search?: string;
    sortBy?: 'id' | 'firstname' | 'lastname';
    isDescending?: boolean;
}

export interface ActorMovieDto {
    movieId: number;
    title: string;
    roleName?: string;
    releaseDate?: string;
}

export interface CreateActorDto {
    firstName: string;
    lastName: string;
    photoUri?: string;
}