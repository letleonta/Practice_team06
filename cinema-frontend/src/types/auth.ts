export interface LoginResponseDto {
    token: string;
    expiration: string;
    email: string;
}

export interface AuthResultDto {
    succeeded: boolean;
    response?: LoginResponseDto;
    errors?: string[];
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    birthDate: string;
}

export interface ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
}

export interface ChangeEmailDto {
    currentEmail: string;
    newEmail: string;
    currentPassword: string;
}

export interface ResetPasswordDto {
    email: string;
    token: string;
    newPassword: string;
}