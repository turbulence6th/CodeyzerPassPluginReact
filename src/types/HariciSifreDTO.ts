export interface HariciSifreDTO {
    id?: string;
    encryptedData: string;
    encryptedMetadata: string;
    aesIV: string;
}

export interface HariciSifreSaveRequestDTO {
    id: string;
    encryptedData: string;
    encryptedMetadata: string;
    aesIV: string;
}

export interface HariciSifreUpdateRequestDTO {
    encryptedData: string;
    encryptedMetadata: string;
    aesIV: string;
}

export interface HariciSifreDesifre {
    id?: string;
    data: HariciSifreHariciSifreData;
    metadata: HariciSifreMetadata;
    aesIV?: string;
}

export interface HariciSifreHariciSifreData {
    kullaniciAdi: string;
    sifre: string;
}

export interface HariciSifreMetadata {
    url: string;
    android: string;
}

// Backend'deki SifreGuncelleHariciSifreDTO için interface
// (HesapPaneli'nden taşındı)
export interface SifreGuncelleHariciSifreDTO {
    eskiId: string; // Değiştirilecek eski kaydın ID'si
    id: string; // Yeni kaydın ID'si (client'ta üretildi)
    encryptedData: string;
    encryptedMetadata: string;
    aesIV: string;
} 