import { registerPlugin } from '@capacitor/core';
import AndroidPaketSecenek from '../ortak/AndroidPaketSecenek';

interface CodeyzerAutofillPlugin {
    sifreListesiGuncelle: () => Promise<void>
    androidPaketGetir: () => Promise<{paketList: AndroidPaketSecenek[]}>
    otomatikDoldurBilgi: () => Promise<{etkin: boolean, destek: boolean}>
    otomatikDoldurEtkinlestir: () => Promise<void>
    sonKullanilanAndroidPaketGetir: () => Promise<{androidPaket: string}>
}

export default registerPlugin('CodeyzerAutofillPlugin') as CodeyzerAutofillPlugin;
