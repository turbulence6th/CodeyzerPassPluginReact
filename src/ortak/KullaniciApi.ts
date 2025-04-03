import { Cevap } from "./Cevap"
import { KullaniciDogrulaDTO, KullaniciOlusturDTO } from "./KullaniciDTO"
import axios from "axios";

export const yeni = async (istek: KullaniciOlusturDTO): Promise<Cevap<string>> => {
    const response = await axios.post('/kullanici/yeni', istek);
    return response.data;
};

export const dogrula = async (istek: KullaniciDogrulaDTO): Promise<Cevap<string>> => {
    const response = await axios.post('/kullanici/dogrula', istek);
    return response.data;
};
