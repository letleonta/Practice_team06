import {useEffect, useState } from "react";
import type {MovieDto} from "../types/movie.ts";
import {MovieService} from "../services/movie.service.ts";
import MoviesLayout from "../layouts/MoviesLayout.tsx";

const NowPlayingPage = () => {
    const [movies, setMovies] = useState<MovieDto[]>([]);

    useEffect(() => {
        MovieService.getNowPlaying().then(setMovies);
    }, []);

    return <MoviesLayout movies={movies} title="Зараз у кіно" />;
};

export default NowPlayingPage;