export interface HariciSifreDTO {
    kimlik: string
    icerik: string
}

export interface HariciSifreDesifre {
    kimlik: string
    icerik: HariciSifreIcerik
}

export interface HariciSifreIcerik {
    platform: string
    androidPaket: string
    kullaniciAdi: string
    sifre: string
}

export interface HariciSifreGetirDTO {
    kullaniciKimlik: string
}

export interface HariciSifreKaydetDTO {
    icerik: string
    kullaniciKimlik: string
}

export interface HariciSifreGuncelleDTO {
    kimlik: string
    icerik: string
    kullaniciKimlik: string
}

export interface HariciSifreSilDTO {
    kimlik: string
    kullaniciKimlik: string
}

export interface HariciSifreYenileDTO {
    hariciSifreListesi: HariciSifreYenileElemanDTO[]
    kullaniciKimlik: string
    yeniKullaniciKimlik: string
}

export interface HariciSifreYenileElemanDTO {
    icerik: string
}
