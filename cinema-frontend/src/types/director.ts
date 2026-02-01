export interface CreateDirectorDto {
    firstName: string;
    lastName: string;
    photoUri?: string;
}

export interface DirectorDto {
    id: number;
    firstName: string;
    lastName: string;
    photoUri?: string;
}