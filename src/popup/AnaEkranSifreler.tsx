import React, { useEffect, useState } from 'react';
import { alanAdiGetir } from '../ortak/AlanAdiUtil';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useSelector } from 'react-redux';
import { RootState, AygitYoneticiKullan, useAppDispatch } from '..';
import { aktifAnaEkranTabBelirle, mesajBelirle, seciliHariciSifreKimlikBelirle, sifreGuncelDurumBelirle } from '../ortak/CodeyzerReducer';
import AnaEkranTabEnum from './AnaEkranTabEnum';
import { MesajTipi } from '../ortak/BildirimMesaji';
import { useTranslation } from 'react-i18next';
import PlatformTipi from '../ortak/PlatformTipi';
import { dialogGoster } from '../ortak/DialogUtil';
import Yukleniyor from '../ortak/Yukleniyor';
import { HariciSifreApi } from '../ortak/HariciSifreApi';

const AnaEkranSifreler = () => {

    const kullanici = useSelector((state: RootState) => state.codeyzerDepoReducer.kullanici);
    const hariciSifreDesifreListesi = useSelector((state: RootState) => state.codeyzerHafizaReducer.hariciSifreDesifreListesi);
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
                const sekmedekiPlatform = alanAdiGetir(aygitPlatform.platform);
                const platformHarisiSifreDesifre = hariciSifreDesifreListesi.find(hsd => alanAdiGetir(hsd.metadata.url) === sekmedekiPlatform);
                if (platformHarisiSifreDesifre) {
                    seciliPlatformDegistir(sekmedekiPlatform);
                    seciliHariciSifreKimlikDegistir(platformHarisiSifreDesifre.id);
                }
            }
        })();
    }, [aygitYonetici]);

    const platformSecenekleriGetir = () => {
        let alanAdiSet;
        if (seciliCihaz === 'web') {
            alanAdiSet = new Set(hariciSifreDesifreListesi.filter(hsd => hsd.metadata.url).map(hsd => alanAdiGetir(hsd.metadata.url)));
        } else if (seciliCihaz === 'android') {
            alanAdiSet = new Set(hariciSifreDesifreListesi.filter(hsd => hsd.metadata.android).map(hsd => hsd.metadata.android));
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
                return alanAdiGetir(hsd.metadata.url) === seciliPlatform;
            } else if (seciliCihaz === 'android') {
                return hsd.metadata.android === seciliPlatform;
            }
        })
        .map(hsd => ({
            label: hsd.data.kullaniciAdi,
            value: hsd.data.kullaniciAdi
        }));
    }

    const seciliHariciSifreGetir = () => {
        return hariciSifreDesifreListesi
        .find(hsd => hsd.id === seciliHariciSifreKimlik);
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
                    return alanAdiGetir(hsd.metadata.url) === seciliPlatform;
                } else if (seciliCihaz === 'android') {
                    return hsd.metadata.android === seciliPlatform;
                } 

                return false;
            })
            .find(hsd => hsd.data.kullaniciAdi === value);
        seciliHariciSifreKimlikDegistir(hariciSifreDesifre?.id);
    }

    const doldurTiklandi = () => {
        aygitYonetici?.sifreDoldur(seciliHariciSifre?.data.kullaniciAdi!, seciliHariciSifre?.data.sifre!);
    };

    const guncelleTiklandi = (hariciSifreKimlik: string) => {
        dispatch(seciliHariciSifreKimlikBelirle(hariciSifreKimlik));
        dispatch(aktifAnaEkranTabBelirle(AnaEkranTabEnum.SIFRE_EKLE));
    };

    const silTiklandi = () => {
        dialogGoster(t, t('codeyzer.genel.uyari'), t('anaEkranSifreler.sil.click'), 
            async () => {
                await HariciSifreApi.delete(seciliHariciSifre!.id);
                dispatch(sifreGuncelDurumBelirle(false));
            });
    }

    const yenileTiklandi = () => {
        dispatch(sifreGuncelDurumBelirle(false));
    };

    const kopyalaTiklandi = async () => {
        await aygitYonetici?.panoyaKopyala(seciliHariciSifre?.data.sifre!);
        dispatch(mesajBelirle({
            tip: MesajTipi.BILGI,
            icerik: t('anaEkranSifreler.kopyala.click')
        }));
    };

    const seciliHariciSifre = seciliHariciSifreGetir();

    return (
        <div>
           <div className="field">
                <Yukleniyor height='3.3rem' tip='iskelet'>
                    <Dropdown 
                        value={seciliCihaz}
                        onChange={(e) => cihazDegisti(e.value)} 
                        options={[{label: 'Web', value: 'web'}, {label: 'Android', value: 'android'}]} 
                        placeholder="Cihaz seçiniz" 
                        className="w-full h-full" 
                        showClear
                    />
                </Yukleniyor>
            </div>
            <div className="field">
                <Yukleniyor height='3.3rem' tip='iskelet'>
                    <Dropdown 
                        value={seciliPlatform} 
                        onChange={(e) => platformDegisti(e.value)} 
                        options={platformSecenekleriGetir()} 
                        placeholder={t('anaEkranSifreler.platformSelect.seciniz')}
                        className="w-full h-full" 
                        filter
                        filterInputAutoFocus={false}
                        disabled={!seciliCihaz}
                        showClear
                    />
                </Yukleniyor>
            </div>
            <div className="field">
                <Yukleniyor height='3.4rem' tip='iskelet'>
                    <Dropdown 
                        value={seciliHariciSifre?.data.kullaniciAdi} 
                        onChange={(e) => kullanciAdiDegisti(e.value)} 
                        options={kullaniciAdiSecenekleriGetir()} 
                        placeholder={t('anaEkranSifreler.sifreSelect.bos')} 
                        className="w-full h-full" 
                        disabled={!seciliPlatform}
                        showClear
                    />
                </Yukleniyor>
            </div>
            <div className="field">
                <Yukleniyor height='3.4rem' tip='iskelet'>
                    <div className='p-inputgroup h-full'>
                        <InputText 
                            id="sifre" 
                            type={sifreGoster ? 'text' : 'password'} 
                            value={seciliHariciSifre?.data.sifre || ''} 
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
                </Yukleniyor>
            </div>
            { 
            aygitYonetici?.platformTipi() === PlatformTipi.CHROME && 
            <div className="field">
                <Yukleniyor tip='engelle'>
                    <Button 
                        label={t('anaEkranSifreler.doldur.label')}
                        className='w-full' 
                        onClick={doldurTiklandi} 
                        disabled={!seciliHariciSifreKimlik}
                    />
                </Yukleniyor>
            </div>
            }
            <div className="formgrid grid">
                <div className="field col">
                    <Yukleniyor tip='engelle'>
                        <Button 
                            label={t('anaEkranSifreler.guncelle.label')}
                            className='w-full h-full' 
                            onClick={() => guncelleTiklandi(seciliHariciSifreKimlik!)}
                            disabled={!seciliHariciSifreKimlik}
                        />
                    </Yukleniyor>
                </div>
                <div className="field col">
                    <Yukleniyor tip='engelle'>
                        <Button 
                            label={t('anaEkranSifreler.sil.label')}
                            className='w-full h-full' 
                            onClick={silTiklandi} 
                            severity="danger" 
                            outlined
                            disabled={!seciliHariciSifreKimlik}
                        />
                    </Yukleniyor>
                </div>
            </div>
            <div className="flex justify-content-end">
                <div className="grid">
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
                    <div className="col">
                        <Yukleniyor tip='engelle'>
                            <Button 
                                icon="pi pi-refresh"
                                onClick={yenileTiklandi}
                                severity="secondary"
                                title={t('anaEkranSifreler.yenile.title')}
                                className='h-full'
                            />
                        </Yukleniyor>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnaEkranSifreler;
