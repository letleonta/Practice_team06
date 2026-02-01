export interface CreateActorDto {
    firstName: string;
    lastName: string;
    photoUri?: string;
}

export interface ActorDto {
    id: number;
    firstName: string;
    lastName: string;
    photoUri?: string;
}