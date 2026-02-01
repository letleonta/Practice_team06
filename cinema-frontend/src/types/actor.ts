export interface ActorDto {
    id: number;
    firstName: string;
    lastName: string;
    photoUri?: string; // string? -> опціональне поле
}

export interface ActorFilterDto {
    search?: string;
    sortBy?: 'firstname' | 'lastname' | 'id'; // Обмежимо варіанти для безпеки
    isDescending?: boolean;
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