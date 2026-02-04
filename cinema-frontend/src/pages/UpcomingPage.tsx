import type {MovieDto} from "../types/movie.ts";
import {useEffect, useState} from "react";
import MoviesLayout from "../layouts/MoviesLayout.tsx";
import {MovieService} from "../services/movie.service.ts";

const UpcomingPage = () => {
    const [movies, setMovies] = useState<MovieDto[]>([]);

    useEffect(() => {
        MovieService.getUpcoming().then(setMovies);
    }, []);

    return <MoviesLayout movies={movies} title="Скоро в прокаті" />;
};

export default UpcomingPage;