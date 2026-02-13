import { axiosInstance } from "../api/axiosInstance";
import type {
    HallDto,
    CreateHallDto,
    AddRowDto
} from "../types/hall";
import type {PagedResult} from "../types/common.ts";

export const HallService = {

    async getAll(page: number, pageSize: number, searchTerm: string = "") {
        const response = await axiosInstance.get<PagedResult<HallDto>>("/halls", {
            params: { page, pageSize, searchTerm }
        });
        return response.data;
    },

    async getById(id: number) {
        const response = await axiosInstance.get<HallDto>(`/halls/${id}`);
        return response.data;
    },


    async create(data: CreateHallDto) {
        const response = await axiosInstance.post<HallDto>("/halls", data);
        return response.data;
    },

    async delete(id: number) {
        await axiosInstance.delete(`/halls/${id}`);
    },

    async addRow(hallId: number, data: AddRowDto): Promise<void> {
        await axiosInstance.post(`/halls/${hallId}/rows`, data);
    },

    async addSeatToRow(hallId: number, rowNumber: number) {
        const response = await axiosInstance.post(`/halls/${hallId}/seats/add-to-row/${rowNumber}`);
        return response.data;
    },

    async deleteRow(hallId: number, rowNumber: number) {
        await axiosInstance.delete(`/halls/${hallId}/rows/${rowNumber}`);
    }
};