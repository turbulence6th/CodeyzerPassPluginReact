import axios from 'axios';

export const api = axios.create({ baseURL: "http://localhost:9090" });

export class SunucuApi {
    static async get<T>(path: string): Promise<T> {
        const response = await api.get<T>(path);
        return response.data;
    }

    static async post<T>(path: string, data: any): Promise<T> {
        const response = await api.post<T>(path, data);
        return response.data;
    }

    static async put<T>(path: string, data: any): Promise<T> {
        const response = await api.put<T>(path, data);
        return response.data;
    }

    static async delete(path: string): Promise<void> {
        await api.delete(path);
    }
} 