import { PayloadAction } from "@reduxjs/toolkit";
import { Kullanici } from "./KullaniciDTO";
import { HariciSifreDTO, HariciSifreDesifre } from "./HariciSifreDTO";
import AnaEkranTabEnum from "../popup/AnaEkranTabEnum";
import BildirimMesaji from "./BildirimMesaji";

enum CodeyzerActionType {
    KULLANICI_BELIRLE = 'KULLANICI_BELIRLE',
    HARICI_SIFRE_LISTESI_BELIRLE = 'HARICI_SIFRE_LISTESI_BELIRLE',
    HARICI_SIFRE_DESIFRE_LISTESI_BELIRLE = 'HARICI_SIFRE_DESIFRE_LISTESI_BELIRLE',
    SECILI_HARISI_SIFRE_KIMLIK_BELIRLE = 'SECILI_HARISI_SIFRE_KIMLIK_BELIRLE',
    ANA_EKRAN_TAB_BELIRLE = 'ANA_EKRAN_TAB_BELIRLE',
    SIFRE_GUNCEL_DURUM = 'SIFRE_GUNCEL_DURUM',
    MESAJ_BELIRLE = 'MESAJ_BELIRLE',
    ANA_SIFRE_BELIRLE = 'ANA_SIFRE_BELIRLE',
    YUKLENIYOR_BELIRLE = 'YUKLENIYOR_BELIRLE',
    SIFIRLA = 'SIFIRLA'
}

interface CodeyzerDepoReducerState {
    kullanici?: Kullanici
    hariciSifreListesi: HariciSifreDTO[]
}

interface CodeyzerHafizaReducerState {
    hariciSifreDesifreListesi: HariciSifreDesifre[]
    seciliHariciSifreKimlik?: string
    aktifAnaEkranTabEnum?: AnaEkranTabEnum
    sifreGuncelDurum: boolean
    mesaj?: BildirimMesaji
    anaSifre?: string
    yukleniyor: boolean
}

const CODEYZER_DEPO_VARSAYILAN_STATE: CodeyzerDepoReducerState = {
    kullanici: undefined,
    hariciSifreListesi: []
}

const CODEYZER_HAFIZA_VARSAYILAN_STATE: CodeyzerHafizaReducerState = {
    hariciSifreDesifreListesi: [],
    seciliHariciSifreKimlik: undefined,
    aktifAnaEkranTabEnum: undefined,
    sifreGuncelDurum: true,
    mesaj: undefined,
    anaSifre: undefined,
    yukleniyor: false
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
        case CodeyzerActionType.SECILI_HARISI_SIFRE_KIMLIK_BELIRLE:
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
        case CodeyzerActionType.ANA_SIFRE_BELIRLE:
            return {
                ...state,
                anaSifre: action.payload as string
            }
        case CodeyzerActionType.YUKLENIYOR_BELIRLE:
            return {
                ...state,
                yukleniyor: action.payload as boolean
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

const hariciSifreListesiBelirle = (hariciSifreListesi: HariciSifreDTO[]) => {
    return {
        type: CodeyzerActionType.HARICI_SIFRE_LISTESI_BELIRLE,
        payload: hariciSifreListesi
    }
};

const hariciSifreDesifreListesiBelirle = (hariciSifreDesifreListesi: HariciSifreDesifre[]) => {
    return {
        type: CodeyzerActionType.HARICI_SIFRE_DESIFRE_LISTESI_BELIRLE,
        payload: hariciSifreDesifreListesi
    }
};

const seciliHariciSifreKimlikBelirle = (hariciSifreKimlik: string) => {
    return {
        type: CodeyzerActionType.SECILI_HARISI_SIFRE_KIMLIK_BELIRLE,
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

const anaSifreBelirle = (anaSifre: string) => {
    return {
        type: CodeyzerActionType.ANA_SIFRE_BELIRLE,
        payload: anaSifre
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
    hariciSifreDesifreListesiBelirle, 
    seciliHariciSifreKimlikBelirle, 
    aktifAnaEkranTabBelirle, 
    sifreGuncelDurumBelirle,
    mesajBelirle,
    anaSifreBelirle,
    yukleniyorBelirle,
    sifirla
};
