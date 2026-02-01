import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface UserInfo {
    email: string;
    name: string;
    role: string;
}

interface AuthState {
    user: UserInfo | null;
    token: string | null;
    setAuth: (token: string) => void;
    logout: () => void;
}

const getInitialState = () => {
    const token = localStorage.getItem('token');
    if (!token) return { user: null, token: null };

    try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            localStorage.removeItem('token');
            return { user: null, token: null };
        }

        const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role || 'User';
        const email =
            decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]
            || decoded.email
            || '';
        const name =
            decoded["https://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]
            || decoded.name
            || '';

        return {
            token,
            user: { email, name, role }
        };
    } catch (error) {
        localStorage.removeItem('token');
        return { user: null, token: null };
    }
};

export const useAuthStore = create<AuthState>((set) => ({
    ...getInitialState(),

    setAuth: (token: string) => {
        try {
            const decoded: any = jwtDecode(token);
            const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role || 'User';
            const email =
                decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]
                || decoded.email
                || '';
            const name =
                decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]
                || decoded.name
                || '';
            console.log(decoded);

            console.log("NAME"+name);

            localStorage.setItem('token', token);
            set({ token, user: { email, name, role } });
        } catch (error) {
            console.error("Помилка декодування:", error);
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
    },
}));