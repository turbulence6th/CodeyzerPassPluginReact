import { PayloadAction } from "@reduxjs/toolkit";
import { Kullanici } from "../types/KullaniciDTO";
import { HariciSifreDTO, HariciSifreDesifre } from "../types/HariciSifreDTO";
import AnaEkranTabEnum from "../popup/AnaEkranTabEnum";
import BildirimMesaji from "../types/BildirimMesaji";

enum CodeyzerActionType {
    KULLANICI_BELIRLE = 'KULLANICI_BELIRLE',
    HARICI_SIFRE_LISTESI_BELIRLE = 'HARICI_SIFRE_LISTESI_BELIRLE',
    URL_BELIRLE = 'URL_BELIRLE',
    HARICI_SIFRE_DESIFRE_LISTESI_BELIRLE = 'HARICI_SIFRE_DESIFRE_LISTESI_BELIRLE',
    SECILI_HARICI_SIFRE_KIMLIK_BELIRLE = 'SECILI_HARICI_SIFRE_KIMLIK_BELIRLE',
    ANA_EKRAN_TAB_BELIRLE = 'ANA_EKRAN_TAB_BELIRLE',
    SIFRE_GUNCEL_DURUM = 'SIFRE_GUNCEL_DURUM',
    MESAJ_BELIRLE = 'MESAJ_BELIRLE',
    YUKLENIYOR_BELIRLE = 'YUKLENIYOR_BELIRLE',
    SIFRE_BELIRLE = 'SIFRE_BELIRLE',
    SIFIRLA = 'SIFIRLA',
}

interface CodeyzerDepoReducerState {
    kullanici?: Kullanici
    hariciSifreListesi: HariciSifreDTO[]
    url: string
}

interface CodeyzerHafizaReducerState {
    hariciSifreDesifreListesi: HariciSifreDesifre[]
    seciliHariciSifreKimlik?: string
    aktifAnaEkranTabEnum?: AnaEkranTabEnum
    sifreGuncelDurum: boolean
    mesaj?: BildirimMesaji
    yukleniyor: boolean,
    sifre: string
}

const CODEYZER_DEPO_VARSAYILAN_STATE: CodeyzerDepoReducerState = {
    kullanici: undefined,
    hariciSifreListesi: [],
    url: "https://codeyzerpass.tail9fb8f4.ts.net"
}

const CODEYZER_HAFIZA_VARSAYILAN_STATE: CodeyzerHafizaReducerState = {
    hariciSifreDesifreListesi: [],
    seciliHariciSifreKimlik: undefined,
    aktifAnaEkranTabEnum: undefined,
    sifreGuncelDurum: true,
    mesaj: undefined,
    yukleniyor: false,
    sifre: ''
}

const codeyzerDepoReducer = (state: CodeyzerDepoReducerState = CODEYZER_DEPO_VARSAYILAN_STATE, action: PayloadAction<any, CodeyzerActionType>) : CodeyzerDepoReducerState => {
    switch(action.type){
        case CodeyzerActionType.KULLANICI_BELIRLE:
            return {
                ...state,
                kullanici: action.payload as Kullanici
            };
        case CodeyzerActionType.HARICI_SIFRE_LISTESI_BELIRLE:
            return {
                ...state,
                hariciSifreListesi: action.payload as HariciSifreDTO[]
            };
        case CodeyzerActionType.URL_BELIRLE:
            return {
                ...state,
                url: action.payload as string
            }
        case CodeyzerActionType.SIFIRLA:
            return CODEYZER_DEPO_VARSAYILAN_STATE;
        
        default:
            return state
    }
}

const codeyzerHafizaReducer = (state: CodeyzerHafizaReducerState = CODEYZER_HAFIZA_VARSAYILAN_STATE, action: PayloadAction<any, CodeyzerActionType>) : CodeyzerHafizaReducerState => {
    switch(action.type){
        case CodeyzerActionType.HARICI_SIFRE_DESIFRE_LISTESI_BELIRLE:
            return {
                ...state,
                hariciSifreDesifreListesi: action.payload as HariciSifreDesifre[]
            };
        case CodeyzerActionType.SECILI_HARICI_SIFRE_KIMLIK_BELIRLE:
            return {
                ...state,
                seciliHariciSifreKimlik: action.payload as string
            };
        case CodeyzerActionType.ANA_EKRAN_TAB_BELIRLE:
            return {
                ...state,
                aktifAnaEkranTabEnum: action.payload as AnaEkranTabEnum
            };
        case CodeyzerActionType.SIFRE_GUNCEL_DURUM:
            return {
                ...state,
                sifreGuncelDurum: action.payload as boolean
            };
        case CodeyzerActionType.MESAJ_BELIRLE:
            return {
                ...state,
                mesaj: action.payload as BildirimMesaji
            }
        case CodeyzerActionType.YUKLENIYOR_BELIRLE:
            return {
                ...state,
                yukleniyor: action.payload as boolean
            }
        case CodeyzerActionType.SIFRE_BELIRLE:
            return {
                ...state,
                sifre: action.payload as string
            }
        case CodeyzerActionType.SIFIRLA:
            return CODEYZER_HAFIZA_VARSAYILAN_STATE;
        default:
            return state
    }
};

const kullaniciBelirle = (kullanici: Kullanici) => {
    return {
        type: CodeyzerActionType.KULLANICI_BELIRLE,
        payload: kullanici
    }
};

const sifreBelirle = (sifre: string) => {
    return {
        type: CodeyzerActionType.SIFRE_BELIRLE,
        payload: sifre
    }
}

const hariciSifreListesiBelirle = (hariciSifreListesi: HariciSifreDTO[]) => {
    return {
        type: CodeyzerActionType.HARICI_SIFRE_LISTESI_BELIRLE,
        payload: hariciSifreListesi
    }
};

const urlBelirle = (url: string) => {
    return {
        type: CodeyzerActionType.URL_BELIRLE,
        payload: url
    }
}

const hariciSifreDesifreListesiBelirle = (hariciSifreDesifreListesi: HariciSifreDesifre[]) => {
    return {
        type: CodeyzerActionType.HARICI_SIFRE_DESIFRE_LISTESI_BELIRLE,
        payload: hariciSifreDesifreListesi
    }
};

const seciliHariciSifreKimlikBelirle = (hariciSifreKimlik: string) => {
    return {
        type: CodeyzerActionType.SECILI_HARICI_SIFRE_KIMLIK_BELIRLE,
        payload: hariciSifreKimlik
    }
};

const aktifAnaEkranTabBelirle = (anaEkranTab: AnaEkranTabEnum) => {
    return {
        type: CodeyzerActionType.ANA_EKRAN_TAB_BELIRLE,
        payload: anaEkranTab
    }
}

const sifreGuncelDurumBelirle = (sifreGuncelDurum: boolean) => {
    return {
        type: CodeyzerActionType.SIFRE_GUNCEL_DURUM,
        payload: sifreGuncelDurum
    }
}

const mesajBelirle = (mesaj?: BildirimMesaji) => {
    return {
        type: CodeyzerActionType.MESAJ_BELIRLE,
        payload: mesaj
    }
}

const yukleniyorBelirle = (yukleniyor: boolean) => {
    return {
        type: CodeyzerActionType.YUKLENIYOR_BELIRLE,
        payload: yukleniyor
    }
}

const sifirla = () => {
    return {
        type: CodeyzerActionType.SIFIRLA
    };
}

export { 
    codeyzerDepoReducer,
    codeyzerHafizaReducer, 
    kullaniciBelirle, 
    hariciSifreListesiBelirle,
    urlBelirle,
    hariciSifreDesifreListesiBelirle,
    seciliHariciSifreKimlikBelirle,
    aktifAnaEkranTabBelirle,
    sifreGuncelDurumBelirle,
    mesajBelirle,
    yukleniyorBelirle,
    sifirla,
    sifreBelirle,
};

// Tipleri sadece export type ile export ettim.
export type { CodeyzerDepoReducerState, CodeyzerHafizaReducerState }; 