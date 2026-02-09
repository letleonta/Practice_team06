import { axiosInstance } from "../api/axiosInstance";
import type {
    HallDto,
    CreateHallDto,
    GenerateFlexibleSeatsDto,
    SeatDto, RowConfigDto
} from "../types/hall";
import type {PagedResult} from "../types/common.ts";

export const HallService = {

    async getAllPaged(page: number, pageSize: number, searchTerm: string = "") {
        const response = await axiosInstance.get<PagedResult<HallDto>>("/halls/paged", {
            params: { page, pageSize, searchTerm }
        });
        return response.data;
    },

    async getAll() {
        const response = await axiosInstance.get<HallDto[]>("/halls");
        return response.data;
    },

    async getById(id: number) {
        const response = await axiosInstance.get<HallDto>(`/halls/${id}`);
        return response.data;
    },

    async getHallSeats(hallId: number) {
        const response = await axiosInstance.get<SeatDto[]>(`/halls/${hallId}/seats`);
        return response.data;
    },

    async create(data: CreateHallDto) {
        const response = await axiosInstance.post<HallDto>("/halls", data);
        return response.data;
    },

    async delete(id: number) {
        await axiosInstance.delete(`/halls/${id}`);
    },

    async generateFlexibleSeats(data: GenerateFlexibleSeatsDto) {
        const response = await axiosInstance.post<{ message: string }>("/halls/generate-flexible-seats", data);
        return response.data;
    },

    async addRow(hallId: number, rowConfig: RowConfigDto) {
        const response = await axiosInstance.post(`/halls/${hallId}/add-row`, rowConfig);
        return response.data;
    },

    async addSeatToRow(hallId: number, rowNumber: number) {
        const response = await axiosInstance.post(`/halls/${hallId}/seats/add-to-row/${rowNumber}`);
        return response.data;
    },

    async deleteRow(hallId: number, rowNumber: number) {
        await axiosInstance.delete(`/halls/${hallId}/rows/${rowNumber}`);
    }
};