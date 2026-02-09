import type { BaseFilterDto } from "./common";

export interface SessionDto {
    id: number;
    movieTitle: string;
    hallId: number;
    hallName: string;
    languageName: string;
    startTime: string;
    endTime: string;
    ageRestriction: string;
}

export interface CreateSessionDto {
    movieId: number;
    hallId: number;
    languageId: number;
    startTime: string;
}

export interface SessionFilterDto extends BaseFilterDto {
    movieId?: number;
    hallId?: number;
    dateFrom?: string; // ISO date string
    dateTo?: string; // ISO date string
    isActive?: boolean;
}