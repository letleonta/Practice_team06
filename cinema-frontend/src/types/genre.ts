export interface GenreDto {
    id: number;
    name: string;
}

export interface CreateGenreDto {
    name: string;
}

export interface GenreFilterDto {
    search?: string;
    sortBy?: 'name' | 'id';
    isDescending?: boolean;
}