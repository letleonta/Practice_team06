// src/pages/MovieDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import type { MovieDto } from '../types/movie';

export function MovieDetailPage() {
    const { id } = useParams<{ id: string }>(); // Отримуємо ID з посилання
    const [movie, setMovie] = useState<MovieDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            movieService.getById(Number(id))
                .then(data => {
                    setMovie(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [id]);

    if (loading) return <div className="container"><h2>Завантаження...</h2></div>;
    if (!movie) return <div className="container"><h2>Фільм не знайдено</h2></div>;

    return (
        <div className="container movie-detail-page">
            <Link to="/" className="back-link">← Назад до списку</Link>

            <div className="movie-header">
                <div className="movie-poster-large">
                    <img src={movie.posterUri || 'https://via.placeholder.com/400x600'} alt={movie.title} />
                </div>

                <div className="movie-info-main">
                    <span className="age-badge">{movie.ageRestriction}</span>
                    <h1>{movie.title}</h1>
                    <p className="director">Режисер: <span>{movie.directorName}</span></p>

                    <div className="stats">
                        <span className="rating-big">⭐ {movie.rating || 'N/A'}</span>
                        <span className="duration">⏱ {movie.durationMin} хв.</span>
                        <span className="price-tag">Від {movie.basePrice} грн</span>
                    </div>

                    <div className="tags">
                        {movie.genres.map(g => <span key={g} className="genre-tag">{g}</span>)}
                    </div>

                    <div className="description">
                        <h3>Про що фільм</h3>
                        <p>{movie.description}</p>
                    </div>

                    <div className="cast">
                        <h3>У ролях</h3>
                        <p>{movie.actors.join(', ')}</p>
                    </div>
                </div>
            </div>

            {/* МІСЦЕ ДЛЯ СЕАНСІВ (Пункт 2 плану Week 3) */}
            <section className="sessions-section">
                <h2>📅 Розклад сеансів</h2>
                <div className="placeholder-info">
                    Тут будуть сеанси, які ми підтягнемо з SessionsController...
                </div>
            </section>
        </div>
    );
}