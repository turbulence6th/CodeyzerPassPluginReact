export interface KullaniciOlusturDTO {
    kimlik: string
}

export interface KullaniciDogrulaDTO {
    kimlik: string
}

export interface Kullanici {
    kullaniciKimlik: string
    kullaniciAdi: string
    sifreHash: string
}
