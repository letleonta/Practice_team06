import {useState, useMemo, useEffect } from 'react';
import {Check, Search} from 'lucide-react';
import { MovieCard } from '../components/MovieCard';
import type {MovieFilterDto} from '../types/movie';
import {MovieService} from "../services/movie.service.ts";
import {GenreService} from "../services/genre.service.ts";
import type {GenreDto} from "../types/genre.ts";
import {UsePagination} from "../hooks/UsePagination.ts";
import {Pagination} from "../components/Pagination.tsx";
import {PaginationInfo} from "../components/PaginationInfo.tsx";

interface Props {
    title: string;
}

const MoviesLayout = ({ title }: Props) => {
    const [availableGenres, setAvailableGenres] = useState<string[]>([]);
    const [movieFilter, setMovieFilter] = useState<MovieFilterDto>({
        title: '',
        genres: [],
    });

    const fetchMovies = async (page: number, pageSize: number) => {
        const request: MovieFilterDto = {
            ...movieFilter,
            Page: page,
            PageSize: pageSize
        };

        if (title === "Зараз у кіно") {
            return await MovieService.getNowPlaying(request);
        }
        if (title === "Скоро в прокаті") {
            return await MovieService.getUpcoming(request);
        }

        return {
            items: [],
            totalCount: 0,
            page: page,
            pageSize: pageSize,
            totalPages: 0,
            hasPreviousPage: false,
            hasNextPage: false
        };
    };

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const data = await GenreService.getAll({ Page: 1, PageSize: 100 });

                const names = data.items.map((g: GenreDto) => g.name);
                setAvailableGenres(names);
            } catch (error) {
                console.error("Помилка завантаження жанрів:", error);
            }
        };
        fetchGenres().catch((err) => {
            console.error("Помилка завантаження:", err);
        });
    }, []);

    const {
        items: movies,
        totalCount,
        currentPage,
        totalPages,
        pageSize,
        loading,
        goToPage
    } = UsePagination(fetchMovies, [movieFilter, title], { pageSize: 5 });

    const uniqueGenres = useMemo(() => {
        return ['Всі', ...availableGenres];
    }, [availableGenres]);

    const toggleGenres = (genre: string) => {
        console.log(genre);
        setMovieFilter(prev => {
            const currentGenres = prev.genres ?? [];

            let nextGenres: string[];

            if (genre === "Всі") {
                nextGenres = [];
            } else if (currentGenres.includes(genre)) {
                nextGenres = currentGenres.filter(g => g !== genre);
            } else {
                nextGenres = [...currentGenres, genre];
            }

            return { ...prev, genres: nextGenres };
        });
    }

    const isActive = (genre: string): boolean => {
        if (genre === 'Всі') {
            return (movieFilter.genres ?? []).length === 0;
        }
        return movieFilter.genres?.includes(genre) ?? false;
    };

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10">
            <header className="mb-10">
                <h1 className="text-5xl font-black text-white mb-8 tracking-tighter uppercase">{title}</h1>

                <div className="flex flex-col gap-4">
                    {/* Пошук */}
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Пошук фільму..."
                            value={movieFilter.title}
                            onChange={(e) => setMovieFilter(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full bg-[#1a1d26] border border-gray-800 text-white rounded-2xl pl-12 pr-4 py-3 focus:border-red-600 outline-none transition-all"
                        />
                    </div>

                    {/* Жанри */}
                    <div className="flex flex-wrap md:flex-wrap gap-2 pb-2">
                        {uniqueGenres.map(genre => (
                            <button
                                key={genre}
                                onClick={() => toggleGenres(genre)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${
                                    isActive(genre)
                                        ? 'bg-red-600 border-red-600 text-white'
                                        : 'bg-[#1a1d26] border-gray-800 text-gray-400 hover:text-white'
                                }`}
                            >
                                {genre}
                                {isActive(genre) && <Check size={14} strokeWidth={3} />}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center items-center py-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {movies.map(movie => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>

                    {!loading && totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 pb-12 px-6">
                            <PaginationInfo
                                currentPage={currentPage}
                                pageSize={pageSize}
                                totalCount={totalCount}
                                itemName="фільм"
                                className="text-xs"
                            />
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={goToPage}
                            />
                        </div>
                    )}
                </>
            )}

            {!loading && movies.length === 0 && (
                <div className="text-center py-20 text-gray-500 font-medium text-xl animate-fade-in">
                    Нічого не знайдено за вашим запитом
                </div>
            )}
        </div>
    );
};

export default MoviesLayout;