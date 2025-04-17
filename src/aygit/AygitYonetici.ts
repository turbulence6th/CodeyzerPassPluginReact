import AndroidPaketSecenek from "../ortak/AndroidPaketSecenek";
import PlatformTipi from "../ortak/PlatformTipi";

abstract class AygitYonetici {
    abstract depoyaKoy(anahtar: string, deger: string): Promise<void>
    abstract depodanGetir(anahtar: string): Promise<string>
    abstract depodanSil(anahtar: string): Promise<void>
    abstract mevcutDil(): Promise<string>
    abstract platformTipi(): PlatformTipi
    abstract sifreDoldur(kullaniciAdi: string, sifre: string): Promise<any>
    abstract panoyaKopyala(ifade: string): Promise<void>
    abstract platformGetir(): Promise<{ platform: string, androidPaket: string }>
    abstract sekmeAc(sekme: string): void
    abstract otomatikDoldurBilgi(): Promise<{etkin: boolean, destek: boolean}>
    abstract otomatikDoldurEtkinlestir(): Promise<void>
    abstract sifreListesiGuncelle(): Promise<void>
    abstract androidPaketGetir(): Promise<AndroidPaketSecenek[]>
    abstract anaSifreGetir(): Promise<string>
    abstract anaSifreKaydet(sifre: string): Promise<void>
}

export default AygitYonetici;