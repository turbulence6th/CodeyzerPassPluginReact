import { Cevap } from "./Cevap";
import { HariciSifreDTO, HariciSifreGetirDTO, HariciSifreGuncelleDTO, HariciSifreKaydetDTO, HariciSifreSilDTO, HariciSifreYenileDTO } from "./HariciSifreDTO";
import axios from "axios";
import { BASE_URL } from "./Constants";

export const getir = async (istek: HariciSifreGetirDTO): Promise<Cevap<HariciSifreDTO[]>> => {
    const response = await axios.post(BASE_URL + '/hariciSifre/getir', istek);
    return response.data;
};

export const kaydet = async (istek: HariciSifreKaydetDTO): Promise<Cevap<void>> => {
    const response = await axios.post(BASE_URL + '/hariciSifre/kaydet', istek);
    return response.data;
};

export const guncelle = async (istek: HariciSifreGuncelleDTO): Promise<Cevap<void>> => {
    const response = await axios.post(BASE_URL + '/hariciSifre/guncelle', istek);
    return response.data;
};

export const sil = async (istek: HariciSifreSilDTO): Promise<Cevap<void>> => {
    const response = await axios.post(BASE_URL + '/hariciSifre/sil', istek);
    return response.data;
};

export const sifreleriYenile = async (istek: HariciSifreYenileDTO): Promise<Cevap<void>> => {
    const response = await axios.post(BASE_URL + '/hariciSifre/yenile', istek);
    return response.data;
};
