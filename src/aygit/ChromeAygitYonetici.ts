import AygitYonetici from "./AygitYonetici";
import PlatformTipi from "../types/PlatformTipi";
import AndroidPaketSecenek from "../types/AndroidPaketSecenek";

class ChromeAygitYonetici extends AygitYonetici {

    override depoyaKoy(anahtar: string, deger: string): Promise<void> {
        return chrome.storage.local.set({ [anahtar]: deger });
    }

    override async depodanGetir(anahtar: string): Promise<string> {
        const sonuc = await chrome.storage.local.get([anahtar]);
        return sonuc[anahtar];
    }

    override depodanSil(anahtar: string): Promise<void> {
        return chrome.storage.local.remove([anahtar]);
    }

    override async mevcutDil(): Promise<string> {
        return navigator.language;
    }

    override platformTipi(): PlatformTipi {
        return PlatformTipi.CHROME;
    }

    override async sifreDoldur(kullaniciAdi: string, sifre: string): Promise<void> {
        return this.sekmeMesajGonder({
            mesajTipi: 'doldur',
            kullaniciAdi: {
                deger: kullaniciAdi
            },
            sifre: {
                deger: sifre
            }
        });
    }

    override panoyaKopyala(ifade: string): Promise<void> {
        return navigator.clipboard.writeText(ifade);
    }

    sekmeMesajGonder<T>(icerik: any): Promise<T> {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs){
                chrome.tabs.sendMessage(tabs[0].id!!, icerik, (cevap) => {
                    resolve(cevap);
                });
            });
        });
    }

    override async platformGetir(): Promise<{ platform: string, androidPaket: string }> {
         let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
         return {
             platform: this.platformGetirHelper(tab.url!!),
             androidPaket: ''
         };
    }

    platformGetirHelper(url: string) {
        let obj = new URL(url);
        let pathname = obj.pathname;
        if (pathname !== "/" && pathname.endsWith("/")) {
            pathname = pathname.substring(0, pathname.length - 1);
        }
        return obj.hostname + pathname;
    }

    override sekmeAc(sekme: string) {
        if (sekme) {
            window.open(this.pluginUrlGetir('/index.html?app=' + sekme), '_blank');
        } else {
            window.open(this.pluginUrlGetir('/index.html'), '_blank');
        }
    }

    pluginUrlGetir(url: string) {
        return chrome.runtime.getURL(url);
    }

    override async otomatikDoldurBilgi(): Promise<{ etkin: boolean, destek: boolean }> {
        return {
            etkin: true,
            destek: true
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
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: "ANA_SIFRE_GETIR" }, (response) => {
                resolve(response.sifre);
            });
        });
    }

    override async anaSifreKaydet(sifre: string): Promise<void> {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: "ANA_SIFRE_KAYDET", sifre }, (response) => {
                resolve();
            });
        });
    }
}

export default ChromeAygitYonetici;