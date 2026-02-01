export interface DirectorDto {
    id: number;
    firstName: string;
    lastName: string;
    photoUri?: string;
}

export interface DirectorFilterDto {
    search?: string;
    sortBy?: 'firstname' | 'lastname' | 'id';
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