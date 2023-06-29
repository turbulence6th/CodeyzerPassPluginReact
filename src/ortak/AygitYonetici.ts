import PlatformTipi from "./PlatformTipi";

abstract class AygitYonetici {
    abstract depoyaKoy(anahtar: string, deger: string): Promise<void>
    abstract depodanGetir(anahtar: string): Promise<string>
    abstract depodanSil(anahtar: string): Promise<void>
    abstract mevcutDil(): Promise<string>
    abstract platformTipi(): PlatformTipi
    abstract sifreDoldur(kullaniciAdi: string, sifre: string): Promise<any>
    abstract panoyaKopyala(ifade: string): Promise<void>
    abstract platformGetir(): Promise<{ platform: string }>
    abstract sekmeAc(sekme: string): void
}

export default AygitYonetici;