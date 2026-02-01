export interface LanguageDto {
    id: number;
    name: string;
}

export interface CreateLanguageDto {
    name: string;
}

export interface LanguageFilterDto {
    search?: string;
    sortBy?: 'name' | 'id';
    isDescending?: boolean;
}