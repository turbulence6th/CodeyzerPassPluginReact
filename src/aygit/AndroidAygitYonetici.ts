import AygitYonetici from "./AygitYonetici";
import PlatformTipi from "../ortak/PlatformTipi";
import { Clipboard } from '@capacitor/clipboard';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import CodeyzerAutofillPlugin from "./CodeyzerAutofillPlugin";
import AndroidPaketSecenek from "../ortak/AndroidPaketSecenek";

class AndroidAygitYonetici extends AygitYonetici {

    override depoyaKoy(anahtar: string, deger: string): Promise<void> {
        return Preferences.set({
            key: anahtar,
            value: deger
        });
    }

    override async depodanGetir(anahtar: string): Promise<string> {
        return (await Preferences.get({ key: anahtar })).value!;
    }

    override async depodanSil(anahtar: string): Promise<void> {
       await Preferences.remove({ key: anahtar });
    }

    override async mevcutDil(): Promise<string> {
        return (await Device.getLanguageCode()).value.substring(0, 2);
    }

    override platformTipi(): PlatformTipi {
        return PlatformTipi.ANDROID;
    }

    override async sifreDoldur(kullaniciAdi: string, sifre: string): Promise<void> {
        
    }

    override async panoyaKopyala(ifade: string): Promise<void> {
        await Clipboard.write({
            string: ifade
        });
    }

    override async platformGetir(): Promise<{ platform: string, androidPaket: string }> {
         return {
            platform: '',
            androidPaket: (await CodeyzerAutofillPlugin.sonKullanilanAndroidPaketGetir()).androidPaket
         }
    }

    override sekmeAc(sekme: string) {
       
    }

    override otomatikDoldurBilgi(): Promise<{ etkin: boolean, destek: boolean }> {
        return CodeyzerAutofillPlugin.otomatikDoldurBilgi();
    }

    override otomatikDoldurEtkinlestir(): Promise<void> {
        return CodeyzerAutofillPlugin.otomatikDoldurEtkinlestir();
    }

    override sifreListesiGuncelle(): Promise<void> {
        return CodeyzerAutofillPlugin.sifreListesiGuncelle();
    }

    override async androidPaketGetir(): Promise<AndroidPaketSecenek[]> {
        return (await CodeyzerAutofillPlugin.androidPaketGetir()).paketList;
    }
}

export default AndroidAygitYonetici;