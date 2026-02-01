import api from '../api/axiosInstance';
import type {UserDto} from '../types/user';

export const userService = {
    getAll: async () => {
        const response = await api.get<UserDto[]>('/auth/users');
        return response.data;
    },
    assignRole: async (email: string, roleName: string) => {
        return await api.post('/auth/assign-role', null, {
            params: { email, roleName }
        });
    }
};