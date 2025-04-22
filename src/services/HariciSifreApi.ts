import { HariciSifreDTO, HariciSifreSaveRequestDTO, HariciSifreUpdateRequestDTO } from "../types/HariciSifreDTO";
import { SunucuApi } from "./SunucuApi";

export class HariciSifreApi {
    private static readonly BASE_URL = '/api/harici-sifre';

    static async getAll(): Promise<HariciSifreDTO[]> {
        return await SunucuApi.get(this.BASE_URL);
    }

    static async save(dto: HariciSifreSaveRequestDTO): Promise<HariciSifreDTO> {
        return await SunucuApi.post(`${this.BASE_URL}/kaydet`, dto);
    }

    static async update(id: string, dto: HariciSifreUpdateRequestDTO): Promise<HariciSifreDTO> {
        return await SunucuApi.put(`${this.BASE_URL}/guncelle/${id}`, dto);
    }

    static async delete(id: string): Promise<void> {
        await SunucuApi.delete(`${this.BASE_URL}/sil/${id}`);
    }
} 