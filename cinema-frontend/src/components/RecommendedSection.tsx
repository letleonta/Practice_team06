import { useEffect, useState } from 'react';
import { MovieService } from '../services/movie.service';
import type { MovieDto } from '../types/movie';
import { MovieCard } from './MovieCard';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const RecommendedSection = () => {
    const { user } = useAuthStore();
    const [movies, setMovies] = useState<MovieDto[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!user) {
                setMovies([]);
                return;
            }

            setLoading(true);
            try {
                const data = await MovieService.getRecommendations(5);
                setMovies(data);
            } catch {
                setMovies([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [user]);

    if (!user || (!loading && movies.length === 0)) return null;

    return (
        <section className="max-w-7xl mx-auto p-6 md:p-10">
            <header className="mb-10">
                <div className="flex items-center gap-4 mb-2">
                    <Sparkles className="text-red-600" size={40} strokeWidth={2.5} />
                    <h2 className="text-5xl font-black text-white tracking-tighter uppercase">
                        Підібрано для вас
                    </h2>
                </div>
                <p className="text-xs font-bold text-red-600 uppercase tracking-[0.3em] ml-14">
                    Персональна добірка на основі ваших вподобань
                </p>
            </header>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-red-600" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {movies.map(movie => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            )}

            {/* Тонка лінія-розділювач, щоб відокремити від наступного сектора */}
            <div className="flex items-center gap-6 mt-20 opacity-20">
                <div className="h-px flex-1 bg-gray-500"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 whitespace-nowrap">
                    Весь каталог
                </span>
                <div className="h-px flex-1 bg-gray-500"></div>
            </div>
        </section>
    );
};