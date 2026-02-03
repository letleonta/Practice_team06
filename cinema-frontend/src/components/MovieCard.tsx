import { Link } from 'react-router-dom';
import { Clock, Ticket } from 'lucide-react';
import { AgeRestrictionBadge } from './AgeRestrictionBadge';
import type { MovieDto } from '../types/movie';

interface Props {
    movie: MovieDto;
}

export const MovieCard = ({ movie }: Props) => (
    <Link to={`/movie/${movie.id}`} className="group block">
        <div className="relative aspect-[2/3] rounded-3xl overflow-hidden border border-gray-800 group-hover:border-red-600/50 transition-all duration-500">
            {movie.posterUri ? (
                <img src={movie.posterUri} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
            ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">No Poster</div>
            )}

            <div className="absolute top-4 left-4">
                <AgeRestrictionBadge restriction={movie.ageRestriction} />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <div className="w-full bg-white text-black font-black py-3 rounded-2xl flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-2xl">
                    <Ticket size={18} /> КУПИТИ КВИТОК
                </div>
            </div>
        </div>

        <div className="mt-5 space-y-2">
            <h3 className="font-bold text-xl truncate group-hover:text-red-500 transition-colors">{movie.title}</h3>
            <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-400 text-xs italic">
                    <Clock size={14} className="text-red-600" /> {movie.durationMin} хв
                </span>
                <span className="text-gray-200 font-black text-sm">{movie.basePrice} ₴</span>
            </div>
        </div>
    </Link>
);