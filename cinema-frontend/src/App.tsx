import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import NowPlayingPage from './pages/NowPlayingPage.tsx';
import UpcomingPage from './pages/UpcomingPage.tsx';
import MoviePage from './pages/MoviePage';
import Register from './pages/Register';
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import MyBookingsPage from './pages/MyBookingsPage.tsx';
import BookingDetailsPage from "./pages/BookingDetailsPage.tsx";
import SessionPage from "./pages/SessionPage.tsx";
import MainLayout from "./layouts/MainLayout.tsx";
import {Profile} from "./pages/Profile.tsx";
import { useAuthStore } from './store/useAuthStore';
import { Toaster } from 'react-hot-toast';
import {useEffect} from "react";
import {UserService} from "./services/user.service.ts";

function App() {
    const { user, token, updateUser } = useAuthStore();

    const hasAdminAccess = token && (user?.role === 'Admin' || user?.role === 'Manager');

    useEffect(() => {
        if (token) {
            UserService.getProfile()
                .then(data => {
                    updateUser({
                        firstName: data.firstName,
                        avatarUri: data.avatarUri
                    });
                })
                .catch(err => console.error("Помилка синхронізації:", err));
        }
    }, [token, updateUser]);


    return (
        <BrowserRouter>
            <Toaster position="top-center" />
            <Routes>
                <Route
                    path="/login"
                    element={<Login />}
                />
                <Route
                    path="/register"
                    element={<Register />}
                />
                <Route element={<MainLayout />}>
                    <Route
                        path="/"
                        element={<NowPlayingPage />}
                    />
                    <Route
                        path="/upcoming"
                        element={<UpcomingPage />}
                    />
                    <Route path="/movie/:id"
                           element={<MoviePage />}
                    />
                    <Route
                        path="/bookings/my"
                        element={<MyBookingsPage />}
                    />
                    <Route
                        path="/bookings/:bookingId"
                        element={<BookingDetailsPage />}
                    />
                    <Route
                        path="/sessions/:sessionId"
                        element={<SessionPage />}
                    />
                    <Route
                        path="/profile"
                        element={token ? <Profile /> : <Navigate to="/login" replace />}
                    />
                </Route>
                <Route
                    path="/admin/*"
                    element={hasAdminAccess ? <AdminDashboard /> : <Navigate to="/" replace />}
                />
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;