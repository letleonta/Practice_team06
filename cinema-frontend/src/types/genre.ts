
export interface GenreDto {
    id: number;
    name: string;
}

export interface CreateGenreDto {
    name: string;
}

export interface GenreFilterDto {
    search?: string;
    sortBy?: 'id' | 'name';
    isDescending?: boolean;
    Page?: number;
    PageSize?: number;
}