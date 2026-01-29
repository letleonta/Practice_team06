import { Link, Outlet } from 'react-router-dom'; // Outlet потрібен для вкладених маршрутів
import '../styles/AdminPage.css'; // Новий файл стилів

export function AdminPage() {
    return (
        <div className="container admin-layout">
            <aside className="admin-sidebar">
                <nav>
                    <h3>Керування контентом</h3>
                    <ul>
                        <li><Link to="movies">Фільми</Link></li>
                        <li><Link to="directors">Режисери</Link></li>
                        <li><Link to="genres">Жанри</Link></li>
                        <li><Link to="actors">Актори</Link></li>
                    </ul>
                    <h3>Керування кінотеатром</h3>
                    <ul>
                        <li><Link to="halls">Зали</Link></li>
                        <li><Link to="sessions">Сеанси</Link></li>
                        <li><Link to="seats">Місця</Link></li>
                    </ul>
                    <h3>Користувачі</h3>
                    <ul>
                        <li><Link to="users">Користувачі</Link></li>
                        <li><Link to="roles">Ролі</Link></li>
                    </ul>
                </nav>
            </aside>
            <main className="admin-content">
                {/* Тут будуть відображатися компоненти для керування фільмами/залами */}
                <Outlet />
            </main>
        </div>
    );
}