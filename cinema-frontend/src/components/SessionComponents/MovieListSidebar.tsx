import { useState, useEffect } from 'react';
import { MovieService } from '../../services/movie.service';
import type { MovieDto } from '../../types/movie';
import { UsePagination } from '../../hooks/UsePagination';
import { Film, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAgeRestrictionText } from '../../utils/formatAgeRestriction';

interface Props {
    selectedMovieId: number | undefined;
    onSelectMovie: (movie: MovieDto) => void;
}

export const MovieListSidebar = ({ selectedMovieId, onSelectMovie }: Props) => {
    const [movieSearch, setMovieSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const {
        items: movies,
        currentPage,
        totalPages,
        loading,
        goToPage
    } = UsePagination<MovieDto>(
        async (page, size) => {
            return await MovieService.getAll({
                Page: page,
                PageSize: size,
                title: debouncedSearch
            });
        },
        [debouncedSearch],
        { pageSize: 6 }
    );

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(movieSearch), 500);
        return () => clearTimeout(timer);
    }, [movieSearch]);

    return (
        <div className="w-full lg:w-1/3 bg-[#1a1d26] rounded-4xl border border-gray-800 shadow-2xl flex flex-col overflow-hidden h-full">
            <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-black flex items-center gap-2 mb-4 uppercase tracking-tighter">
                    <Film className="text-red-600" /> Оберіть фільм
                </h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                        type="text"
                        placeholder="Пошук..."
                        value={movieSearch}
                        onChange={(e) => setMovieSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl outline-none focus:border-red-500 text-sm transition-all text-white"
                    />
                </div>
            </div>

            <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar">
                {loading ? (
                    <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-red-600" /></div>
                ) : movies.length > 0 ? (
                    movies.map(movie => (
                        <button
                            key={movie.id}
                            onClick={() => onSelectMovie(movie)}
                            className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all border text-left group
                            ${selectedMovieId === movie.id
                                ? 'bg-red-600 border-red-500 shadow-lg shadow-red-900/50'
                                : 'bg-gray-900/50 border-gray-800 hover:bg-gray-800 hover:border-gray-600'}`}
                        >
                            <div className="w-12 h-16 bg-gray-800 rounded-xl overflow-hidden shrink-0 shadow-sm border border-black/20">
                                {movie.posterUri ? (
                                    <img src={movie.posterUri} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600"><Film size={16} /></div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-sm truncate text-white">{movie.title}</h3>
                                <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${selectedMovieId === movie.id ? 'text-red-200' : 'text-gray-500'}`}>
                                    {movie.durationMin} хв • {getAgeRestrictionText(movie.ageRestriction)}
                                </p>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-center p-6">
                        <Film size={40} className="mb-3 opacity-20" />
                        <p className="font-bold text-sm">Фільмів не знайдено</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="p-3 border-t border-gray-800 bg-gray-900/20 flex items-center justify-between">
                    <button disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)} className="p-2 hover:bg-gray-800 rounded-lg disabled:opacity-20 text-white">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-[10px] font-black uppercase text-gray-500">Стор. {currentPage} / {totalPages}</span>
                    <button disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)} className="p-2 hover:bg-gray-800 rounded-lg disabled:opacity-20 text-white">
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};