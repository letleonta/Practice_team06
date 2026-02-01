import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import {Checkout} from "./pages/Checkout";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import { useAuthStore } from './store/useAuthStore';

function App() {
    const { user, token } = useAuthStore();

    const hasAdminAccess = token && (user?.role === 'Admin' || user?.role === 'Manager');

    return (
        <BrowserRouter>
            <Routes>
                {/* Тепер тут буде відображатися контент з файлу src/pages/Home.tsx */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/checkout" element={<Checkout />} />
                <Route
                    path="/admin/*"
                    element={hasAdminAccess ? <AdminDashboard /> : <Navigate to="/" replace />}
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;