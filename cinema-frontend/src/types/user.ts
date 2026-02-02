export interface UserDto {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    birthDate: string; // ISO date string
    avatarUrl?: string;
    roles: string[]; // Масив ролей, бо Identity повертає список
}

export interface AssignRoleDto {
    email: string;
    roleName: string;
}

export interface UpdateProfileDto {
    firstName: string;
    lastName: string;
    birthDate: string;
}