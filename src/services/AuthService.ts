import { VAULT_SALT } from "../constants/Constants";
import { HariciSifreDesifre, HariciSifreDTO } from "../types/HariciSifreDTO";
import { base64ToUint8Array, bcryptHash, decryptWithAES, deriveAesKey, encryptWithAES, generateIV, sha512, uint8ArrayToBase64, vaultIdOlustur } from "../utils/CryptoUtil";

export class AuthService {

    private kullaniciKimlik: string;
    private sifre: string;
    private aesKey: CryptoKey;
    
    private constructor(kullaniciKimlik: string, sifre: string, aesKey: CryptoKey) {
        this.kullaniciKimlik = kullaniciKimlik;
        this.sifre = sifre;
        this.aesKey = aesKey;
    }

    static async createByKullaniciKimlik(kullaniciKimlik: string, sifre: string) {
        const aesKey = await deriveAesKey(sifre, kullaniciKimlik);
        return new AuthService(kullaniciKimlik, sifre, aesKey);
    }

    static async createByKullaniciAdi(kullaniciAdi: string, sifre: string) {
        const kullaniciKimlik = await vaultIdOlustur(kullaniciAdi, sifre, VAULT_SALT);
        return AuthService.createByKullaniciKimlik(kullaniciKimlik, sifre);
    }

    kullaniciKimlikGetir() {
        return this.kullaniciKimlik;
    }

    async sifreSha512Olustur() {
        return await sha512(this.sifre);
    }

    async sifreBcryptHashOlustur() {
        return await bcryptHash(this.sifre);
    }

    aesKeyGetir() {
        return this.aesKey;
    }
    
    ivOlustur() {
        return generateIV();
    }

    async sifrelenmisVeriOlustur(hsd: HariciSifreDesifre) : Promise<HariciSifreDTO> {
        const iv = generateIV();
        return {
            id: hsd.id,
            encryptedData: await encryptWithAES(this.aesKey, JSON.stringify(hsd.data), iv),
            encryptedMetadata: await encryptWithAES(this.aesKey, JSON.stringify(hsd.metadata), iv),
            aesIV: uint8ArrayToBase64(iv)
        }
    }

    async sifrelenmisVeriCoz(hsd: HariciSifreDTO): Promise<HariciSifreDesifre> {
        const iv = base64ToUint8Array(hsd.aesIV);
        return {
            id: hsd.id,
            data: JSON.parse(await decryptWithAES(this.aesKey, hsd.encryptedData, iv)),
            metadata: JSON.parse(await decryptWithAES(this.aesKey, hsd.encryptedMetadata, iv)),
            aesIV: hsd.aesIV
        }
    }

    async kullaniciAdiDogrula(kullaniciAdi: string) {
        return await vaultIdOlustur(kullaniciAdi, this.sifre, VAULT_SALT) === this.kullaniciKimlik;
    }
}

