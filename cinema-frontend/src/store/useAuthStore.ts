import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface UserInfo {
    email: string;
    role: string;
}

interface AuthState {
    user: UserInfo | null;
    token: string | null;
    setAuth: (token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem('token'),

    setAuth: (token: string) => {
        try {
            const decoded: any = jwtDecode(token);

            // В ASP.NET Identity роль зазвичай лежить за цим довгим ключем:
            const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
                || decoded.role
                || 'User';

            const email = decoded.email || decoded.sub || '';

            localStorage.setItem('token', token);
            set({
                token,
                user: { email, role }
            });
        } catch (error) {
            console.error("Помилка декодування токена:", error);
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
    },
}));