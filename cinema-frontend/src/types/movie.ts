export interface MovieDto {
    id: number;
    title: string;
    description?: string;
    durationMin?: number;
    releaseDate?: string;
    basePrice: number;
    rating?: number;
    posterUri?: string;
    ageRestriction: string;
    startDate?: string;
    endDate?: string;
    directorName: string;
    genres: string[];
    actors: string[];
    languageIds: number[];
}
export interface CreateMovieDto {
    title: string;
    description: string;
    durationMin: number;
    releaseDate: string;
    basePrice: number;
    startDate?: string;
    endDate?: string;
    posterUri?: string;
    trailerUri?: string;
    languageIds: number[];
    ageRestriction: number;
    directorId?: number;
    genreIds: number[];
    actorIds: number[];
    rating?: number;
}

export const AgeRestriction = {
    ZeroPlus: 0,
    TwelvePlus: 1,
    SixteenPlus: 2,
    EighteenPlus: 3
} as const;

export type AgeRestrictionType = typeof AgeRestriction[keyof typeof AgeRestriction];

export const formatAgeRestriction = (ageString: string): string => {
    const map: Record<string, string> = {
        "ZeroPlus": "0+",
        "TwelvePlus": "12+",
        "SixteenPlus": "16+",
        "EighteenPlus": "18+"
    };
    return map[ageString] || ageString;
};