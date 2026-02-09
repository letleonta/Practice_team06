// Додаємо спільний інтерфейс фільтра, якщо він у вас є в types/common.ts,
// то можна наслідуватись від нього (як BaseFilterDto).
// Якщо ні - просто пропиши ці поля тут:

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