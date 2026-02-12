import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MovieDto } from '../types/movie';
import { AgeRestrictionBadge } from "./ui/AgeRestrictionBadge.tsx";
import { formatDateWithYear } from "../utils/formatTime";
import { Button } from "./ui/Button";

interface HeroSliderProps {
    movies: MovieDto[];
    currentSlide: number;
    onSlideChange: (index: number) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ movies, currentSlide, onSlideChange }) => {
    const navigate = useNavigate();
    const activeHero = movies[currentSlide];

    const nextSlide = () => onSlideChange((currentSlide + 1) % movies.length);
    const prevSlide = () => onSlideChange((currentSlide - 1 + movies.length) % movies.length);

    if (!activeHero) return null;

    return (
        <header className="relative h-screen w-full overflow-hidden group/hero bg-[#0f1117]">
            <div className="absolute inset-0 z-0">
                <img
                    key={activeHero.id}
                    src={activeHero.posterUri}
                    alt={activeHero.title}
                    className="w-full h-screen object-cover animate-[scaleIn_20s_infinite_alternate] opacity-50"
                    style={{ objectPosition: 'center 20%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f1117] via-[#0f1117]/60 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-transparent to-transparent z-10" />
            </div>

            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/5 hover:bg-red-600 text-white backdrop-blur-md transition-all opacity-0 group-hover/hero:opacity-100 hidden md:flex"
            >
                <ChevronLeft size={25} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/5 hover:bg-red-600 text-white backdrop-blur-md transition-all opacity-0 group-hover/hero:opacity-100 hidden md:flex"
            >
                <ChevronRight size={25} />
            </button>

            <div className="relative z-20 h-full flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto pt-20">
                <div className="max-w-3xl space-y-6">
                    <div className="flex items-center gap-4 text-sm font-bold uppercase text-gray-300">
                        <AgeRestrictionBadge restriction={activeHero.ageRestriction} />
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                        <span>{activeHero.genres?.[0]?.name}</span>
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                        <span>{formatDateWithYear(activeHero.releaseDate)}</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.85]">
                        {activeHero.title}
                    </h1>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-yellow-400 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                            <Star fill="currentColor" size={20} />
                            <span className="font-black">{activeHero.rating?.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 font-bold">
                            <Clock size={20} className="text-red-500"/>
                            <span>{activeHero.durationMin} хв</span>
                        </div>
                    </div>

                    <p className="text-gray-400 text-lg md:text-xl line-clamp-3 font-medium max-w-2xl">
                        {activeHero.description}
                    </p>

                    <div className="pt-4">
                        <Button
                            variant="primary"
                            onClick={() => navigate(`/movie/${activeHero.id}`)}
                            icon={<Info size={24} />}
                            className="px-12 py-5 text-xl rounded-2xl"
                        >
                            Детальніше про фільм
                        </Button>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                {movies.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSlideChange(idx)}
                        className={`h-2 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-12 bg-red-600' : 'w-3 bg-white/20'}`}
                    />
                ))}
            </div>
        </header>
    );
};