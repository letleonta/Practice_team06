import { useEffect, useState } from 'react';
import { MovieService } from '../services/movie.service';
import type {MovieDto} from '../types/movie';
import { MovieCard } from './MovieCard';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const RecommendedSection = () => {
    const { user } = useAuthStore();
    const [movies, setMovies] = useState<MovieDto[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Якщо юзера немає, просто очищуємо список і нічого не робимо
        if (!user) {
            setMovies([]);
            return;
        }

        // Створюємо асинхронну функцію всередині ефекту
        const fetchRecommendations = async () => {
            setLoading(true);
            try {
                const data = await MovieService.getRecommendations(5);
                setMovies(data);
            } catch (err: unknown) {
                // Перевіряємо тип помилки замість any, щоб задовольнити лінтер
                if (err && typeof err === 'object' && 'response' in err) {
                    const axiosError = err as { response: { status: number } };
                    if (axiosError.response?.status !== 401) {
                        console.error("Помилка рекомендацій:", err);
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [user]); // Ефект спрацює при зміні об'єкта user

    if (!user || (!loading && movies.length === 0)) return null;

    return (
        <div className="mb-14 p-10 rounded-4xl bg-[#1a1d26]/50 border border-gray-800 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-red-600 p-2.5 rounded-2xl shadow-lg shadow-red-600/20">
                    <Sparkles className="text-white" size={24} />
                </div>
                <div className="text-left">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Підібрано для вас</h2>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mt-1">Персональна добірка</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-red-600" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                    {movies.map(movie => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            )}
        </div>
    );
};