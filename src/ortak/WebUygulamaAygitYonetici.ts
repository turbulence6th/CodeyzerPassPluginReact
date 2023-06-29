import AygitYonetici from "./AygitYonetici";
import PlatformTipi from "./PlatformTipi";

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

    override async platformGetir(): Promise<{ platform: string }> {
        return {
            platform: ''
        };
    }

    override sekmeAc(sekme: string) {
        window.open('?app=' + sekme, '_blank')
    }
}

export default WebUygulamaAygitYonetici;