import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

// 1. Оновлюємо інтерфейс користувача
interface UserInfo {
    email: string;
    name: string;
    role: string | string[];
    id: string;
    firstName?: string;  // Додано
    avatarUrl?: string;  // Додано
}

interface AuthState {
    user: UserInfo | null;
    token: string | null;
    isAuth: boolean;
    setAuth: (token: string) => void;
    // 2. Метод для оновлення даних "на льоту" (для синхронізації з Navbar)
    updateUser: (data: Partial<UserInfo>) => void;
    logout: () => void;
}

// Константи для клеймів .NET Identity
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const ID_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier";
const EMAIL_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
const NAME_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";

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

        const role = decoded[ROLE_CLAIM] || decoded.role || 'User';
        const email = decoded[EMAIL_CLAIM] || decoded.email || '';
        const name = decoded[NAME_CLAIM] || decoded.name || '';

        return {
            token,
            isAuth: true,
            user: {
                email: email,
                name: name,
                role: role,
                id: decoded[ID_CLAIM],
                // Навіть якщо в токені їх немає, TypeScript тепер знає про ці поля
                firstName: name,
                avatarUrl: undefined
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
            const role = decoded[ROLE_CLAIM] || decoded.role || 'User';
            const email = decoded[EMAIL_CLAIM] || decoded.email || '';
            const name = decoded[NAME_CLAIM] || decoded.name || '';

            const user = {
                email: email,
                name: name,
                role: role,
                id: decoded[ID_CLAIM],
                firstName: name,
            };

            localStorage.setItem('token', token);
            set({ token, user, isAuth: true });
        } catch (error) {
            console.error("Помилка декодування токена:", error);
        }
    },

    // 3. Додаємо реалізацію оновлення користувача
    updateUser: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
    })),

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuth: false });
    },
}));