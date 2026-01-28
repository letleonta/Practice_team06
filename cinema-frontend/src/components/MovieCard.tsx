import type { MovieDto } from '../types/movie';
import { Link } from 'react-router-dom';

export function MovieCard({ movie }: { movie: MovieDto }) {
    const poster = movie.posterUri || 'https://via.placeholder.com/300x450?text=No+Poster';

    return (
        <div className="card">
            <div className="card-img-wrapper">
                <Link to={`/movie/${movie.id}`}>
                    <img src={poster} alt={movie.title} />
                </Link>
            </div>
            <div className="card-info">
                <h3>{movie.title}</h3>
                <p className="genres">{movie.genres.join(', ')}</p>
                <div className="meta">
                    <span className="rating">⭐ {movie.rating?.toFixed(1) || '0.0'}</span>
                    <span className="price">
                        {Number(movie.basePrice).toLocaleString('uk-UA')} грн
                    </span>
                </div>
                <Link to={`/movie/${movie.id}`} className="details-btn">Квитки</Link>
            </div>
        </div>
    );
}