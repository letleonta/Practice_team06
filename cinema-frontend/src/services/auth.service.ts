import { axiosInstance } from "../api/axiosInstance";
import type {
    AuthResultDto,
    LoginDto,
    LoginResponseDto,
    RegisterDto,
    ChangePasswordDto,
    ResetPasswordDto,
    UserDto,
    ChangeEmailDto
} from "../types/auth";

export const AuthService = {
    async register(data: RegisterDto): Promise<AuthResultDto> {
        const response = await axiosInstance.post<AuthResultDto>("/auth/register", data);
        return response.data;
    },

    async login(data: LoginDto): Promise<LoginResponseDto> {
        const response = await axiosInstance.post<LoginResponseDto>("/auth/login", data);
        console.log(response);
        return response.data;
    },

    async changePassword(data: ChangePasswordDto): Promise<void> {
        await axiosInstance.post("/auth/change-password", data);
    },

    async changeEmail(data: ChangeEmailDto): Promise<LoginResponseDto> {
        const response = await axiosInstance.post<LoginResponseDto>("/auth/change-email", data);
        return response.data;
    },

    async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
        const response = await axiosInstance.post("/auth/forgot-password", { email });
        return response.data;
    },

    async resetPassword(data: ResetPasswordDto): Promise<void> {
        await axiosInstance.post("/auth/reset-password", data);
    },

    async getAllUsers(): Promise<UserDto[]> {
        const response = await axiosInstance.get<UserDto[]>("/auth/users");
        return response.data;
    },

    async assignRole(email: string, roleName: string): Promise<void> {
        await axiosInstance.post(`/auth/assign-role?email=${email}&roleName=${roleName}`);
    }
};