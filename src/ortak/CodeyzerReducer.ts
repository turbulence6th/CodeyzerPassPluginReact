import { PayloadAction } from "@reduxjs/toolkit";
import { Kullanici } from "./KullaniciDTO";
import { HariciSifreDesifre } from "./HariciSifreDTO";
import AnaEkranTabEnum from "../popup/AnaEkranTabEnum";
import BildirimMesaji from "./BildirimMesaji";

enum CodeyzerActionType {
    KULLANICI_BELIRLE = 'KULLANICI_BELIRLE',
    HARICI_SIFRE_DESIFRE_LISTESI_BELIRLE = 'HARICI_SIFRE_DESIFRE_LISTESI_BELIRLE',
    SECILI_HARISI_SIFRE_KIMLIK_BELIRLE = 'SECILI_HARISI_SIFRE_KIMLIK_BELIRLE',
    ANA_EKRAN_TAB_BELIRLE = 'ANA_EKRAN_TAB_BELIRLE',
    SIFRE_GUNCEL_DURUM = 'SIFRE_GUNCEL_DURUM',
    MESAJ_BELIRLE = 'MESAJ_BELIRLE',
    SIFIRLA = 'SIFIRLA'
}

interface CodeyzerDepoReducerState {
    kullanici?: Kullanici,
    hariciSifreDesifreListesi: HariciSifreDesifre[]
}

interface CodeyzerHafizaReducerState {
    seciliHariciSifreKimlik?: string,
    aktifAnaEkranTabEnum?: AnaEkranTabEnum,
    sifreGuncelDurum: boolean,
    mesaj?: BildirimMesaji
}

const CODEYZER_DEPO_VARSAYILAN_STATE: CodeyzerDepoReducerState = {
    kullanici: undefined,
    hariciSifreDesifreListesi: []
}

const CODEYZER_HAFIZA_VARSAYILAN_STATE: CodeyzerHafizaReducerState = {
    seciliHariciSifreKimlik: undefined,
    aktifAnaEkranTabEnum: undefined,
    sifreGuncelDurum: false,
    mesaj: undefined
}

const codeyzerDepoReducer = (state: CodeyzerDepoReducerState = CODEYZER_DEPO_VARSAYILAN_STATE, action: PayloadAction<any, CodeyzerActionType>) : CodeyzerDepoReducerState => {
    switch(action.type){
        case CodeyzerActionType.KULLANICI_BELIRLE:
            return {
                ...state,
                kullanici: action.payload as Kullanici
            };
        case CodeyzerActionType.HARICI_SIFRE_DESIFRE_LISTESI_BELIRLE:
            return {
                ...state,
                hariciSifreDesifreListesi: action.payload as HariciSifreDesifre[]
            };
        case CodeyzerActionType.SIFIRLA:
            return CODEYZER_DEPO_VARSAYILAN_STATE;
        default:
            return state
    }
}

const codeyzerHafizaReducer = (state: CodeyzerHafizaReducerState = CODEYZER_HAFIZA_VARSAYILAN_STATE, action: PayloadAction<any, CodeyzerActionType>) : CodeyzerHafizaReducerState => {
    switch(action.type){
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

const sifirla = () => {
    return {
        type: CodeyzerActionType.SIFIRLA
    };
}

export { 
    codeyzerDepoReducer,
    codeyzerHafizaReducer, 
    kullaniciBelirle, 
    hariciSifreDesifreListesiBelirle, 
    seciliHariciSifreKimlikBelirle, 
    aktifAnaEkranTabBelirle, 
    sifreGuncelDurumBelirle,
    mesajBelirle,
    sifirla
};
