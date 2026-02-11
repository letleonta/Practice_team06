import { useEffect, useState } from 'react';
import { MovieService } from '../services/movie.service';
import type { MovieDto } from '../types/movie';
import { HeroSlider } from '../components/HeroSlider';
import MoviesLayout from '../layouts/MoviesLayout';

const HomePage = () => {
    const [heroMovies, setHeroMovies] = useState<MovieDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const topRatedRes = await MovieService.getAll({ Page: 1, PageSize: 11, rating: 7.0 });

                const now = new Date();
                const activeTopRated = (topRatedRes.items || []).filter(movie => {
                    const start = movie.releaseDate ? new Date(movie.releaseDate) : null;
                    const end = movie.endDate ? new Date(movie.endDate) : null;
                    return (!start || start <= now) && (!end || end >= now);
                });

                setHeroMovies(activeTopRated);
            } catch (error) {
                console.error("Помилка:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (heroMovies.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [heroMovies.length]);

    if (loading) return (
        <div className="h-screen bg-[#0f1117] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f1117] text-white font-sans overflow-x-hidden">
            <HeroSlider
                movies={heroMovies}
                currentSlide={currentSlide}
                onSlideChange={setCurrentSlide}
            />

            <div className="relative z-20 space-y-4">
                <div id="now-playing" className="relative z-30 pb-20">
                    <MoviesLayout title="Зараз у кіно" />
                </div>
            </div>
        </div>
    );
};

export default HomePage;