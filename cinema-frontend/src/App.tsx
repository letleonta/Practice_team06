import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import {Checkout} from "./pages/Checkout";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import MyBookingsPage from './pages/MyBookingsPage.tsx';
import BookingDetailsPage from "./pages/BookingDetailsPage.tsx";
import SessionPage from "./pages/SessionPage.tsx";
import MainLayout from "./layouts/MainLayout.tsx";
import AdminBookings from "./pages/admin/AdminBookings.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="*" element={<Navigate to="/" />} />

                <Route path="/register" element={<Register />} />

                <Route path="/admin/*" element={<AdminDashboard />} />

                <Route path="/checkout" element={<Checkout />} />
                <Route path="/admin/bookings" element={<AdminBookings />} />

                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />

                    <Route path="/bookings/my" element={<MyBookingsPage />} />
                    <Route path="/bookings/:bookingId" element={<BookingDetailsPage />} />

                    <Route path="/sessions/:sessionId" element={<SessionPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;