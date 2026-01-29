import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { BookingPage } from './pages/BookingPage';
import { AdminPage } from './pages/AdminPage';
import './App.css';
const UpcomingPage = () => (
    <div className="container">
        <h2 style={{marginTop: '40px'}}>⏳ Скоро у прокаті</h2>
        <p>Ця сторінка знаходиться в розробці...</p>
    </div>
);

function App() {
    return (
        <BrowserRouter>
            {/* Хедер на всю ширину екрана */}
            <header className="main-header">
                <div className="container header-content">
                    <Link to="/" className="logo">
                        <span>🎬</span> CINEMA-HUB
                    </Link>
                    <nav className="main-nav">
                        <Link to="/">У КІНО</Link>
                        <Link to="/upcoming">СКОРО</Link>
                        <Link to="/admin">АДМІН</Link>
                    </nav>
                </div>
            </header>

            {/* Основний контент сторінок */}
            <main>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/movie/:id" element={<MovieDetailPage />} />
                    <Route path="/booking/:sessionId" element={<BookingPage />} />

                    <Route path="/upcoming" element={<UpcomingPage />} />

                    {/* Адмін-панель */}
                    <Route path="/admin" element={<AdminPage />}>
                        {/* Дефолтна сторінка для адмінки */}
                        <Route index element={<h2>Ласкаво просимо в Адмін-панель!</h2>} />

                        {/* Керування фільмами */}
                        <Route path="movies" element={<div>Список фільмів для адміна</div>} />
                        <Route path="movies/create" element={<div>Форма створення фільму</div>} />
                        <Route path="movies/edit/:id" element={<div>Форма редагування фільму</div>} />

                        {/* Керування залами */}
                        <Route path="halls" element={<div>Список залів для адміна</div>} />
                        {/* ... тут будуть інші вкладені маршрути */}

                        <Route path="*" element={
                            <div className="container">
                                <h1 style={{marginTop: '100px'}}>404: Сторінку не знайдено</h1>
                                <Link to="/" style={{color: '#ffcc00'}}>Повернутися на головну</Link>
                            </div>
                        } />
                    </Route>



                    {/* Обробка неіснуючих посилань */}
                    <Route path="*" element={
                        <div className="container">
                            <h1 style={{marginTop: '100px'}}>404: Сторінку не знайдено</h1>
                            <Link to="/" style={{color: '#ffcc00'}}>Повернутися на головну</Link>
                        </div>
                    } />
                </Routes>
            </main>

            {/* Футер */}
            <footer className="main-footer">
                <div className="container">
                    <p>© 2026 Cinema Team 06. Усі права захищені.</p>
                </div>
            </footer>
        </BrowserRouter>
    );
}

export default App;