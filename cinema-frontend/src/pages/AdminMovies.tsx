import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import type { MovieDto } from '../types/movie';

export function AdminMovies() {
    const [movies, setMovies] = useState<MovieDto[]>([]);

    const loadMovies = () => movieService.getAll().then(setMovies);

    useEffect(() => { loadMovies(); }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm("Видалити цей фільм?")) {
            await movieService.delete(id);
            loadMovies();
        }
    };

    return (
        <div>
            <div className="admin-header">
                <h2>Список фільмів</h2>
                <Link to="create" className="add-btn">+ Додати фільм</Link>
            </div>
            <table className="admin-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Назва</th>
                    <th>Режисер</th>
                    <th>Ціна</th>
                    <th>Дії</th>
                </tr>
                </thead>
                <tbody>
                {movies.map(m => (
                    <tr key={m.id}>
                        <td>{m.id}</td>
                        <td>{m.title}</td>
                        <td>{m.directorName}</td>
                        <td>{m.basePrice} грн</td>
                        <td>
                            <button onClick={() => handleDelete(m.id)} className="delete-btn">Видалити</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}