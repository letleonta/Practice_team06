import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import {Checkout} from "./pages/Checkout";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import { useAuthStore } from './store/useAuthStore';
import MyBookingsPage from './pages/MyBookingsPage.tsx';
import BookingDetailsPage from "./pages/BookingDetailsPage.tsx";
import SessionPage from "./pages/SessionPage.tsx";
import MainLayout from "./layouts/MainLayout.tsx";

function App() {
    const { user, token } = useAuthStore();

    const hasAdminAccess = token && (user?.role === 'Admin' || user?.role === 'Manager');

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route path="/checkout" element={<Checkout />} />

                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />

                    <Route path="/bookings/my" element={<MyBookingsPage />} />
                    <Route path="/bookings/:bookingId" element={<BookingDetailsPage />} />

                    <Route path="/sessions/:sessionId" element={<SessionPage />} />
                </Route>
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