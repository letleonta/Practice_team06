// src/types/actor.ts

export interface ActorDto {
    id: number;
    firstName: string;
    lastName: string;
    photoUri: string | null;
}

export interface CreateActorDto {
    firstName: string;
    lastName: string;
    photoUri?: string;
}

// Для методу отримання фільмів актора
export interface ActorMovieDto {
    movieId: number;
    title: string;
    releaseDate: string | null;
}

// Для фільтрації (якщо захочеш додати пошук на фронтенді)
export interface ActorFilterDto {
    search?: string;
    sortBy?: string;
    isDescending?: boolean;
}