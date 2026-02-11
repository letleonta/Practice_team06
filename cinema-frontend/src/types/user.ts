import type {BaseFilterDto} from "./common.ts";

export interface UserDto {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    avatarUri?: string;
    roles: string[];
}

export interface UpdateProfileDto {
    firstName: string;
    lastName: string;
    birthDate: string;
}

export interface UserFilterDto extends BaseFilterDto {
    search?: string;
    sortBy?: 'email' | 'firstname' | 'lastname' | 'id';
    isDescending?: boolean;
}