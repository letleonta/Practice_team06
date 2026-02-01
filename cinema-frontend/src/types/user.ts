export interface UserDto {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[]; // Масив ролей, бо Identity повертає список
}

export interface AssignRoleDto {
    email: string;
    roleName: string;
}