export interface DirectorDto {
    id: number;
    firstName: string;
    lastName: string;
    photoUri?: string;
}

export interface DirectorFilterDto {
    search?: string;
    sortBy?: 'id' | 'firstname' | 'lastname';
    isDescending?: boolean;
    Page?: number;
    PageSize?: number;
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