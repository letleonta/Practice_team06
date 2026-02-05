export interface ActorDto {
    id: number;
    firstName: string;
    lastName: string;
    photoUri?: string; // string? -> опціональне поле
}

export interface ActorFilterDto {
    search?: string;
    sortBy?: 'id' | 'firstname' | 'lastname';
    isDescending?: boolean;
    Page?: number;
    PageSize?: number;
}

export interface ActorMovieDto {
    movieId: number;
    title: string;
    roleName?: string;
    releaseDate?: string; // DateOnly приходить як "YYYY-MM-DD"
}

export interface CreateActorDto {
    firstName: string;
    lastName: string;
    photoUri?: string;
}