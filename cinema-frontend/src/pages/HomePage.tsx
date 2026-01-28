// src/pages/HomePage.tsx
import { useEffect, useState } from 'react';
import type { MovieDto } from '../types/movie';
import { movieService } from '../services/movieService';
import { MovieCard } from '../components/MovieCard';

export function HomePage() {
    const [nowPlaying, setNowPlaying] = useState<MovieDto[]>([]);
    const [upcoming, setUpcoming] = useState<MovieDto[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [playing, next] = await Promise.all([
                    movieService.getNowPlaying(),
                    movieService.getUpcoming()
                ]);
                setNowPlaying(playing);
                setUpcoming(next);
            } catch (err) {
                console.error("Помилка завантаження:", err);
            }
        };
        loadData();
    }, []);

    return (
        <div className="container">
            <section>
                <h2 className="section-title">🔥 Зараз у кіно</h2>
                <div className="movie-grid">
                    {nowPlaying.map(movie => <MovieCard key={movie.id} movie={movie} />)}
                </div>
            </section>

            <section style={{ marginTop: '50px' }}>
                <h2 className="section-title">⏳ Скоро у прокаті</h2>
                <div className="movie-grid">
                    {upcoming.map(movie => <MovieCard key={movie.id} movie={movie} />)}
                </div>
            </section>
        </div>
    );
}