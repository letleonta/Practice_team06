import api from "../api/axiosInstance";
import type { UserDto, UpdateProfileDto } from "../types/user";

export const UserService = {
    // Отримати профіль поточного юзера
    async getProfile() {
        const response = await api.get<UserDto>("/users/profile");
        return response.data;
    },

    // Оновити персональні дані
    async updateProfile(data: UpdateProfileDto) {
        const response = await api.put("/users/profile", data);
        return response.data;
    },

    // Завантажити аватарку
    async uploadAvatar(file: File) {
        const formData = new FormData();
        formData.append("file", file); // Назва 'file' має збігатися з параметром у C#

        const response = await api.post<{ avatarUrl: string }>("/users/avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    }
};