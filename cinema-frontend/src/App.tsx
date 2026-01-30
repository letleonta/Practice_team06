import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Тепер тут буде відображатися контент з файлу src/pages/Home.tsx */}
                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />

                <Route path="*" element={<Navigate to="/" />} />

                <Route path="/register" element={<Register />} />

                <Route path="/admin/*" element={<AdminDashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;