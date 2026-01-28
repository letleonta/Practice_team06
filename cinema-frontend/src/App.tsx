// src/App.tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import './App.css';
import { MovieDetailPage } from './pages/MovieDetailPage';

function App() {
    return (
        <BrowserRouter>
            <header className="main-header">
                <div className="container header-content">
                    <Link to="/" className="logo">🎬 CINEMA-HUB</Link>
                    <nav>
                        <Link to="/">Головна</Link>
                        <Link to="/admin" className="admin-link">Адмін-панель</Link>
                    </nav>
                </div>
            </header>

            <main>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/movie/:id" element={<MovieDetailPage />} /> {/* ТЕПЕР ПРАЦЮЄ */}
                    <Route path="/admin" element={<div>Панель адміністратора</div>} />
                </Routes>
            </main>

            <footer className="main-footer">
                <p>&copy; 2026 Cinema Team 06. Усі права захищені.</p>
            </footer>
        </BrowserRouter>
    );
}

export default App;