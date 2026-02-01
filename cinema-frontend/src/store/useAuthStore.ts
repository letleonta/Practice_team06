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

// Функція для відновлення стану користувача при оновленні сторінки
const getInitialState = () => {
    const token = localStorage.getItem('token');
    if (!token) return { user: null, token: null };

    try {
        const decoded: any = jwtDecode(token);
        // Перевіряємо чи токен не прострочений
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            localStorage.removeItem('token');
            return { user: null, token: null };
        }

        const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role || 'User';
        const email = decoded.email || decoded.sub || '';

        return {
            token,
            user: { email, role }
        };
    } catch (error) {
        localStorage.removeItem('token');
        return { user: null, token: null };
    }
};

export const useAuthStore = create<AuthState>((set) => ({
    // Ініціалізуємо стан відразу при створенні стору
    ...getInitialState(),

    setAuth: (token: string) => {
        try {
            const decoded: any = jwtDecode(token);
            const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role || 'User';
            const email = decoded.email || decoded.sub || '';

            localStorage.setItem('token', token);
            set({ token, user: { email, role } });
        } catch (error) {
            console.error("Помилка декодування:", error);
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
    },
}));