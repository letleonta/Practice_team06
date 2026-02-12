import { Link } from 'react-router-dom';
import { Clock, Ticket } from 'lucide-react';
import { AgeRestrictionBadge } from './ui/AgeRestrictionBadge.tsx';
import type { MovieDto } from '../types/movie';
import {formatDateShortWithoutYear} from "../utils/formatTime.ts";
import {useState} from "react";

interface Props {
    movie: MovieDto;
}

export const MovieCard = ({ movie }: Props) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <Link to={`/movie/${movie.id}`} className="group block">
            <div className="relative aspect-2/3 rounded-3xl overflow-hidden border border-gray-800 group-hover:border-red-600/50 transition-all duration-500">
                {movie.posterUri ? (
                    <img src={movie.posterUri} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">No Poster</div>
                )}

                <div className="absolute top-4 left-4">
                    <AgeRestrictionBadge restriction={movie.ageRestriction} />
                </div>

                <div className="absolute inset-0 bg-linear-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="w-full bg-white text-black font-black py-3 rounded-2xl flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-2xl">
                        <Ticket size={18} /> КУПИТИ КВИТОК
                    </div>
                </div>
            </div>

            <div className="mt-5 space-y-2">
                <h3 className="font-bold text-xl truncate group-hover:text-red-500 transition-colors">{movie.title}</h3>


                <div className="flex flex-wrap gap-2 text-[10px] text-gray-500 font-bold uppercase relative z-30">
                    {(isExpanded ? movie.genres : movie.genres.slice(0, 2)) .filter(genre => genre !== null) .map(genre => (
                        <span
                            key={genre.id}
                            className="bg-gray-800/50 px-2 py-0.5 rounded border border-gray-700/50 whitespace-nowrap"
                        >
                            {genre.name}
                        </span>
                    ))}

                    {movie.genres.length > 2 && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className="bg-red-600/20 text-red-500 px-2 py-0.5 rounded border border-red-600/30 hover:bg-red-600 hover:text-white transition-colors cursor-pointer uppercase"
                        >
                            {isExpanded ? 'Згорнути' : `+${movie.genres.length - 2}`}
                        </button>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <Clock size={14} className="text-red-600" /> {movie.durationMin} хв
                    </span>
                    {movie.endDate && (
                        <span className="text-gray-400 text-xs">В прокаті до {formatDateShortWithoutYear(movie.endDate)}</span>
                    )}
                </div>
            </div>
        </Link>
    );
};