import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { sessionService } from '../services/sessionService';
import type { MovieDto } from '../types/movie';
import type { SessionDto } from '../types/session';
import { formatAge } from '../utils/formatters';

export function MovieDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate(); // Для кнопки "Назад"
    const [movie, setMovie] = useState<MovieDto | null>(null);
    const [sessions, setSessions] = useState<SessionDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const movieId = Number(id);
            Promise.all([
                movieService.getById(movieId),
                sessionService.getByMovieId(movieId)
            ])
                .then(([movieData, sessionsData]) => {
                    setMovie(movieData);
                    setSessions(sessionsData);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <div className="container"><h2>Завантаження...</h2></div>;
    if (!movie) return <div className="container"><h2>Фільм не знайдено</h2></div>;

    return (
        <div className="container movie-detail-page">
            {/* Кнопка Повернутися */}
            <button onClick={() => navigate(-1)} className="back-btn">
                ← Назад
            </button>

            <div className="movie-detail-content">
                <div className="movie-detail-poster">
                    <img src={movie.posterUri || 'https://via.placeholder.com/400x600'} alt={movie.title} />
                </div>

                <div className="movie-detail-info">
                    <div className="age-tag">{formatAge(movie.ageRestriction)}</div>
                    <h1>{movie.title}</h1>

                    <div className="movie-meta-row">
                        <span className="rating-tag">⭐ {movie.rating?.toFixed(1)}</span>
                        <span className="duration-tag">⏱ {movie.durationMin} хв.</span>
                        <span className="price-tag">від {Math.round(movie.basePrice)} грн</span>
                    </div>

                    <div className="info-section">
                        <h3>Режисер</h3>
                        <p>{movie.directorName}</p>
                    </div>

                    <div className="info-section">
                        <h3>Жанри</h3>
                        <div className="genre-list">
                            {movie.genres.map(g => <span key={g} className="genre-pill">{g}</span>)}
                        </div>
                    </div>

                    <div className="info-section">
                        <h3>Про що фільм</h3>
                        <p className="description-text">{movie.description}</p>
                    </div>

                    <div className="info-section">
                        <h3>У ролях</h3>
                        <p className="cast-text">{movie.actors.join(', ')}</p>
                    </div>
                </div>
            </div>

            <section className="sessions-detail-section">
                <h2>🗓️ Розклад сеансів</h2>
                {sessions.length > 0 ? (
                    <div className="sessions-grid">
                        {sessions.map(s => (
                            <Link key={s.id} to={`/booking/${s.id}`} className="session-button">
                                <div className="s-time">{formatTime(s.startTime)}</div>
                                <div className="s-hall">{s.hallName}</div>
                                <div className="s-lang">{s.languageName}</div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">На жаль, сеансів немає</p>
                )}
            </section>
        </div>
    );
}