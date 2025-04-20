import AygitYonetici from "./AygitYonetici";
import PlatformTipi from "../ortak/PlatformTipi";
import AndroidPaketSecenek from "../ortak/AndroidPaketSecenek";

class WebUygulamaAygitYonetici extends AygitYonetici {
    
    override async depoyaKoy(anahtar: string, deger: string): Promise<void> {
        localStorage[anahtar] = deger;
    }

    override async depodanGetir(anahtar: string): Promise<string> {
        return localStorage[anahtar];
    }

    override async depodanSil(anahtar: string): Promise<void> {
        localStorage.removeItem(anahtar);
    }

    override async mevcutDil(): Promise<string> {
        return navigator.language;
    }

    override platformTipi(): PlatformTipi {
        return PlatformTipi.WEB;
    }

    override async sifreDoldur(kullaniciAdi: string, sifre: string): Promise<void> {
        
    }

    override panoyaKopyala(ifade: string): Promise<void> {
        return navigator.clipboard.writeText(ifade);
    }

    override async platformGetir(): Promise<{ platform: string, androidPaket: string }> {
        return {
            platform: '',
            androidPaket: ''
        };
    }

    override sekmeAc(sekme: string) {
        window.open('?app=' + sekme, '_blank')
    }

    override async otomatikDoldurBilgi(): Promise<{ etkin: boolean, destek: boolean }> {
        return {
            etkin: false,
            destek: false
        }
    }

    override async otomatikDoldurEtkinlestir(): Promise<void> {
        
    }

    override async sifreListesiGuncelle(): Promise<void> {
        
    }

    override async androidPaketGetir(): Promise<AndroidPaketSecenek[]> {
        return [];
    }
    
    override async anaSifreGetir(): Promise<string> {
        return sessionStorage['anaSifre'];
    }

    override async anaSifreKaydet(sifre: string): Promise<void> {
        sessionStorage['anaSifre'] = sifre;
    }
}

export default WebUygulamaAygitYonetici;