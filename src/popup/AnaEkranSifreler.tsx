import React, { useEffect, useState } from 'react';
import { alanAdiGetir } from '../ortak/AlanAdiUtil';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useSelector } from 'react-redux';
import { RootState, AygitYoneticiKullan, useAppDispatch } from '..';
import { aktifAnaEkranTabBelirle, mesajBelirle, seciliHariciSifreKimlikBelirle, sifreGuncelDurumBelirle } from '../ortak/CodeyzerReducer';
import AnaEkranTabEnum from './AnaEkranTabEnum';
import * as HariciSifreApi from '../ortak/HariciSifreApi';
import { MesajTipi } from '../ortak/BildirimMesaji';
import { useTranslation } from 'react-i18next';
import PlatformTipi from '../ortak/PlatformTipi';
import { dialogGoster } from '../ortak/DialogUtil';

const AnaEkranSifreler = () => {

    const kullanici = useSelector((state: RootState) => state.codeyzerDepoReducer.kullanici);
    const hariciSifreDesifreListesi = useSelector((state: RootState) => state.codeyzerDepoReducer.hariciSifreDesifreListesi);
    const aygitYonetici = AygitYoneticiKullan();
    const [seciliCihaz, seciliCihazDegistir] = useState<string>();
    const [seciliPlatform, seciliPlatformDegistir] = useState<string>();
    const [seciliHariciSifreKimlik, seciliHariciSifreKimlikDegistir] = useState<string>();
    const [sifreGoster, sifreGosterDegistir] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        const platformTipi = aygitYonetici?.platformTipi();
        if (platformTipi === PlatformTipi.WEB || platformTipi === PlatformTipi.CHROME) {
            seciliCihazDegistir('web');
        } else if (platformTipi === PlatformTipi.ANDROID) {
            seciliCihazDegistir('android');
        }

        (async () => {
            const aygitPlatform = await aygitYonetici?.platformGetir();
            if (aygitPlatform?.platform) {
                seciliPlatformDegistir(alanAdiGetir(aygitPlatform.platform));
            }
        })();
    }, [aygitYonetici]);

    useEffect(() => {
        seciliPlatformDegistir(undefined);
        seciliHariciSifreKimlikDegistir(undefined);
    }, [hariciSifreDesifreListesi]);

    const platformSecenekleriGetir = () => {
        let alanAdiSet;
        if (seciliCihaz === 'web') {
            alanAdiSet = new Set(hariciSifreDesifreListesi.filter(hsd => hsd.icerik.platform).map(hsd => alanAdiGetir(hsd.icerik.platform)));
        } else if (seciliCihaz === 'android') {
            alanAdiSet = new Set(hariciSifreDesifreListesi.filter(hsd => hsd.icerik.androidPaket).map(hsd => hsd.icerik.androidPaket));
        } else {
            alanAdiSet = new Set<string>();
        }

        return [...alanAdiSet]
        .map(alanAdi => ({
            label: alanAdi,
            value: alanAdi
        }))
        .sort((x, y) => x.label.localeCompare(y.label));
    };

    const kullaniciAdiSecenekleriGetir = () => {
        return hariciSifreDesifreListesi
        .filter(hsd => {
            if (seciliCihaz === 'web') {
                return alanAdiGetir(hsd.icerik.platform) === seciliPlatform;
            } else if (seciliCihaz === 'android') {
                return hsd.icerik.androidPaket === seciliPlatform;
            }
        })
        .map(hsd => ({
            label: hsd.icerik.kullaniciAdi,
            value: hsd.icerik.kullaniciAdi
        }));
    }

    const seciliHariciSifreGetir = () => {
        return hariciSifreDesifreListesi
        .find(hsd => hsd.kimlik === seciliHariciSifreKimlik);
    };

    const cihazDegisti = (deger: string) => {
        seciliCihazDegistir(deger);
        seciliPlatformDegistir(undefined);
        seciliHariciSifreKimlikDegistir(undefined);
    }

    const platformDegisti = (value: string) => {
        seciliPlatformDegistir(value);
        seciliHariciSifreKimlikDegistir(undefined);
    }

    const kullanciAdiDegisti = (value: string) => {
        const hariciSifreDesifre = hariciSifreDesifreListesi
            .filter(hsd => {
                if (seciliCihaz === 'web') {
                    return alanAdiGetir(hsd.icerik.platform) === seciliPlatform;
                } else if (seciliCihaz === 'android') {
                    return hsd.icerik.androidPaket === seciliPlatform;
                } 

                return false;
            })
            .find(hsd => hsd.icerik.kullaniciAdi === value);
        seciliHariciSifreKimlikDegistir(hariciSifreDesifre?.kimlik);
    }

    const doldurTiklandi = () => {
        aygitYonetici?.sifreDoldur(seciliHariciSifre?.icerik.kullaniciAdi!, seciliHariciSifre?.icerik.sifre!);
    };

    const guncelleTiklandi = (hariciSifreKimlik: string) => {
        dispatch(seciliHariciSifreKimlikBelirle(hariciSifreKimlik));
        dispatch(aktifAnaEkranTabBelirle(AnaEkranTabEnum.SIFRE_EKLE));
    };

    const silTiklandi = () => {
        dialogGoster(t, 'codeyzer.genel.uyari', 'anaEkranSifreler.sil.click', 
            async () => {
                const cevap = await HariciSifreApi.sil({
                    kimlik: seciliHariciSifreKimlik!,
                    kullaniciKimlik: kullanici!.kullaniciKimlik
                });
                
                if (cevap.basarili) {
                    dispatch(sifreGuncelDurumBelirle(false));
                }
            });
    }

    const yenileTiklandi = () => {
        dispatch(sifreGuncelDurumBelirle(false));
    };

    const kopyalaTiklandi = async () => {
        await aygitYonetici?.panoyaKopyala(seciliHariciSifre?.icerik.sifre!);
        dispatch(mesajBelirle({
            tip: MesajTipi.BILGI,
            icerik: t('anaEkranSifreler.kopyala.click')
        }));
    };

    const seciliHariciSifre = seciliHariciSifreGetir();

    return (
        <div>
            <div className="field">
                <Dropdown 
                    value={seciliCihaz}
                    onChange={(e) => cihazDegisti(e.value)} 
                    options={[{label: 'Web', value: 'web'}, {label: 'Android', value: 'android'}]} 
                    placeholder="Cihaz seçiniz" 
                    className="w-full" 
                />
            </div>
            <div className="field">
                <Dropdown 
                    value={seciliPlatform} 
                    onChange={(e) => platformDegisti(e.value)} 
                    options={platformSecenekleriGetir()} 
                    placeholder={t('anaEkranSifreler.platformSelect.seciniz')}
                    className="w-full" 
                    scrollHeight='17rem'
                    filter
                    showClear
                />
            </div>
            <div className="field">
                <Dropdown 
                    value={seciliHariciSifre?.icerik.kullaniciAdi} 
                    onChange={(e) => kullanciAdiDegisti(e.value)} 
                    options={kullaniciAdiSecenekleriGetir()} 
                    placeholder={t('anaEkranSifreler.sifreSelect.bos')} 
                    className="w-full" 
                    disabled={!seciliPlatform}
                    showClear
                />
            </div>
            <div className="field p-inputgroup">
                <InputText 
                    id="sifre" 
                    type={sifreGoster ? 'text' : 'password'} 
                    value={seciliHariciSifre?.icerik.sifre || ''} 
                    className='w-full' 
                    placeholder={t('anaEkranSifreler.sifreSelectSifre.bos')}
                    disabled
                />
                <Button 
                    icon={"pi pi-clone"} 
                    className="p-button-success" 
                    onClick={kopyalaTiklandi} 
                    disabled={!seciliHariciSifreKimlik}
                    title={t('anaEkranSifreler.kopyala.title')}
                />
                <Button 
                    icon={"pi " + (sifreGoster ? "pi-eye" : "pi-eye-slash")} 
                    className="p-button-success" 
                    onClick={() => sifreGosterDegistir(!sifreGoster)} 
                    disabled={!seciliHariciSifreKimlik}
                    title={t('anaEkranSifreler.sifreSelectGoster.title')}
                />
            </div>
            { 
            aygitYonetici?.platformTipi() === PlatformTipi.CHROME && <div className="field">
                <Button 
                    label={t('anaEkranSifreler.doldur.label')}
                    className='w-full' 
                    onClick={doldurTiklandi} 
                    disabled={!seciliHariciSifreKimlik}
                />
            </div>
            }
            <div className="formgrid grid">
                <div className="field col">
                    <Button 
                        label={t('anaEkranSifreler.guncelle.label')}
                        className='w-full' 
                        onClick={() => guncelleTiklandi(seciliHariciSifreKimlik!)}
                        disabled={!seciliHariciSifreKimlik}
                    />
                </div>
                <div className="field col">
                    <Button 
                        label={t('anaEkranSifreler.sil.label')}
                        className='w-full' 
                        onClick={silTiklandi} 
                        severity="danger" 
                        outlined
                        disabled={!seciliHariciSifreKimlik}
                    />
                </div>
            </div>
            <div className="flex justify-content-end flex-wrap card-container green-container">
                <div className="formgrid grid">
                    {
                    // TODO introjs eklenecek
                    false && <div className="field col">
                        <Button 
                            icon="pi pi-compass"
                            severity="help"
                            title={t('anaEkranSifreler.rehber.title')}
                        />
                    </div>
                    }
                    <div className="field col">
                        <Button 
                            icon="pi pi-refresh"
                            onClick={yenileTiklandi}
                            severity="secondary"
                            title={t('anaEkranSifreler.yenile.title')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnaEkranSifreler;
