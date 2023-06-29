import CryptoJS from 'crypto-js';

const hex2a = (hex: string) => {
    let str = '';
    for (let i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
    return str;
};

export const sifrele = (hamMetin: string, sifre: string) => {
    return CryptoJS.AES.encrypt(hamMetin, sifre).toString();
};

export const hashle = (hamMetin: string) => {
    return CryptoJS.SHA512(hamMetin).toString();
};

export const desifreEt = (sifreliMetin: string, sifre: string) => {
    return hex2a(CryptoJS.AES.decrypt(sifreliMetin, sifre).toString());
};