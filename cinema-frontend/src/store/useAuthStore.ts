import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface UserInfo {
    email: string;
    role: string | string[]; // В .NET може бути одна роль або масив
    id: string;
}

interface AuthState {
    user: UserInfo | null;
    token: string | null;
    isAuth: boolean;
    setAuth: (token: string) => void;
    logout: () => void;
}

// Константи для клеймів .NET Identity
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const ID_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier";

const getInitialState = () => {
    const token = localStorage.getItem('token');
    if (!token) return { user: null, token: null, isAuth: false };

    try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
            localStorage.removeItem('token');
            return { user: null, token: null, isAuth: false };
        }

        return {
            token,
            isAuth: true,
            user: {
                email: decoded.email || decoded.sub || decoded.name,
                role: decoded[ROLE_CLAIM] || 'User',
                id: decoded[ID_CLAIM]
            }
        };
    } catch (error) {
        localStorage.removeItem('token');
        return { user: null, token: null, isAuth: false };
    }
};

export const useAuthStore = create<AuthState>((set) => ({
    ...getInitialState(),

    setAuth: (token: string) => {
        try {
            const decoded: any = jwtDecode(token);

            const user = {
                email: decoded.email || decoded.sub || decoded.name,
                role: decoded[ROLE_CLAIM] || 'User',
                id: decoded[ID_CLAIM]
            };

            localStorage.setItem('token', token);
            set({ token, user, isAuth: true });
        } catch (error) {
            console.error("Помилка декодування токена:", error);
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuth: false });
    },
}));