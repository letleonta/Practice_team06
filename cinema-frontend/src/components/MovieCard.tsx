import type { MovieDto } from '../types/movie';
import { Link } from 'react-router-dom';
export function MovieCard({ movie }: { movie: MovieDto }) {
    return (
        <div className="card">
            <div className="card-img-wrapper">
                <Link to={`/movie/${movie.id}`}>
                    <img
                        src={movie.posterUri || 'https://via.placeholder.com/300x450'}
                        alt={movie.title}
                    />
                </Link>
            </div>

            <div className="card-info">
                <div className="meta">
                    <span className="rating">★ {movie.rating?.toFixed(1) || '0.0'}</span>
                    <span className="price">{Math.round(movie.basePrice)} грн</span>
                </div>

                <h3>{movie.title}</h3>
                <p className="genres">{movie.genres.join(', ')}</p>

                <Link to={`/movie/${movie.id}`} className="details-btn">
                    Квитки
                </Link>
            </div>
        </div>
    );
}