// src/services/adminService.ts
import type {ActorDto} from "../types/actor.ts";
import type {GenreDto} from "../types/genre.ts";
import type {DirectorDto} from "../types/director.ts";

const BASE_URL = "http://localhost:5144/api";

export const adminService = {
    async getDirectors(): Promise<DirectorDto[]> {
        const res = await fetch(`${BASE_URL}/Directors`);
        return await res.json();
    },
    async getGenres(): Promise<GenreDto[]> {
        const res = await fetch(`${BASE_URL}/Genres`);
        return await res.json();
    },
    async getActors(): Promise<ActorDto[]> {
        const res = await fetch(`${BASE_URL}/Actors`);
        return await res.json();
    }
};