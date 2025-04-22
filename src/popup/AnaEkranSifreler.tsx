import React, { useEffect, useState } from 'react';
import { alanAdiGetir } from '../utils/AlanAdiUtil';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useSelector } from 'react-redux';
import { RootState, AygitYoneticiKullan, useAppDispatch } from '..';
import { mesajBelirle, sifreGuncelDurumBelirle } from '../store/CodeyzerReducer';
import { MesajTipi } from '../types/BildirimMesaji';
import PlatformTipi from '../types/PlatformTipi';
import { HariciSifreDesifre } from '../types/HariciSifreDTO';
import Yukleniyor from '../components/Yukleniyor';

const AnaEkranSifreler = () => {

    const kullanici = useSelector((state: RootState) => state.codeyzerDepoReducer.kullanici);
    const hariciSifreDesifreListesi = useSelector((state: RootState) => state.codeyzerHafizaReducer.hariciSifreDesifreListesi);
    const aygitYonetici = AygitYoneticiKullan();
    const [seciliCihaz, seciliCihazDegistir] = useState<string>();
    const [seciliPlatform, seciliPlatformDegistir] = useState<string>();
    const [seciliHariciSifreKimlik, seciliHariciSifreKimlikDegistir] = useState<string>();
    const [sifreGoster, sifreGosterDegistir] = useState<boolean>(false);
    const dispatch = useAppDispatch();

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
                const platformHarisiSifreDesifre = hariciSifreDesifreListesi.find((hsd: HariciSifreDesifre) => alanAdiGetir(hsd.metadata.url) === sekmedekiPlatform);
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
            alanAdiSet = new Set(hariciSifreDesifreListesi.filter((hsd: HariciSifreDesifre) => hsd.metadata.url).map((hsd: HariciSifreDesifre) => alanAdiGetir(hsd.metadata.url)));
        } else if (seciliCihaz === 'android') {
            alanAdiSet = new Set(hariciSifreDesifreListesi.filter((hsd: HariciSifreDesifre) => hsd.metadata.android).map((hsd: HariciSifreDesifre) => hsd.metadata.android!));
        } else {
            alanAdiSet = new Set<string>();
        }

        const options: { label: string, value: string }[] = ([...alanAdiSet] as string[])
        .map((alanAdi) => ({
            label: alanAdi,
            value: alanAdi
        }));
        
        return options.sort((x, y) => x.label.localeCompare(y.label));
    };

    const kullaniciAdiSecenekleriGetir = () => {
        return hariciSifreDesifreListesi
        .filter((hsd: HariciSifreDesifre) => {
            if (seciliCihaz === 'web') {
                return alanAdiGetir(hsd.metadata.url) === seciliPlatform;
            } else if (seciliCihaz === 'android') {
                return hsd.metadata.android === seciliPlatform;
            }
            return false;
        })
        .map((hsd: HariciSifreDesifre) => ({
            label: hsd.data.kullaniciAdi,
            value: hsd.data.kullaniciAdi
        }));
    }

    const seciliHariciSifreGetir = () => {
        return hariciSifreDesifreListesi
        .find((hsd: HariciSifreDesifre) => hsd.id === seciliHariciSifreKimlik);
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
            .filter((hsd: HariciSifreDesifre) => {
                if (seciliCihaz === 'web') {
                    return alanAdiGetir(hsd.metadata.url) === seciliPlatform;
                } else if (seciliCihaz === 'android') {
                    return hsd.metadata.android === seciliPlatform;
                } 

                return false;
            })
            .find((hsd: HariciSifreDesifre) => hsd.data.kullaniciAdi === value);
        seciliHariciSifreKimlikDegistir(hariciSifreDesifre?.id);
    }

    const doldurTiklandi = () => {
        aygitYonetici?.sifreDoldur(seciliHariciSifre?.data.kullaniciAdi!, seciliHariciSifre?.data.sifre!);
    };

    const yenileTiklandi = () => {
        dispatch(sifreGuncelDurumBelirle(false));
    };

    const kopyalaTiklandi = async () => {
        await aygitYonetici?.panoyaKopyala(seciliHariciSifre?.data.sifre!);
        dispatch(mesajBelirle({
            tip: MesajTipi.BILGI,
            icerik: 'Şifre panoya kopyalandı.'
        }));
    };

    const seciliHariciSifre = seciliHariciSifreGetir();

    return (
        <div>
           <div className="p-field mb-3">
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
            <div className="p-field mb-3">
                <Yukleniyor height='3.3rem' tip='iskelet'>
                    <Dropdown 
                        value={seciliPlatform} 
                        onChange={(e) => platformDegisti(e.value)} 
                        options={platformSecenekleriGetir()} 
                        placeholder='Platform seçiniz'
                        className="w-full h-full" 
                        filter
                        filterInputAutoFocus={false}
                        disabled={!seciliCihaz}
                        showClear
                    />
                </Yukleniyor>
            </div>
            <div className="p-field mb-3">
                <Yukleniyor height='3.4rem' tip='iskelet'>
                    <Dropdown 
                        value={seciliHariciSifre?.data.kullaniciAdi} 
                        onChange={(e) => kullanciAdiDegisti(e.value)} 
                        options={kullaniciAdiSecenekleriGetir()} 
                        placeholder='Kullanıcı adı seçiniz' 
                        className="w-full h-full" 
                        disabled={!seciliPlatform}
                        showClear
                    />
                </Yukleniyor>
            </div>
            <div className="p-field mb-3">
                <Yukleniyor height='3.4rem' tip='iskelet'>
                    <div className='p-inputgroup h-full'>
                        <InputText 
                            id="sifre" 
                            type={sifreGoster ? 'text' : 'password'} 
                            value={seciliHariciSifre?.data.sifre || ''} 
                            className='w-full' 
                            placeholder='Şifre'
                            disabled
                        />
                        <Button 
                            type="button"
                            icon={"pi pi-clone"} 
                            className="p-button-secondary p-button-outlined" 
                            onClick={kopyalaTiklandi} 
                            disabled={!seciliHariciSifreKimlik}
                            title='Şifreyi Panoya Kopyala'
                        />
                        <Button 
                            type="button"
                            icon={"pi " + (sifreGoster ? "pi-eye" : "pi-eye-slash")} 
                            className="p-button-secondary p-button-outlined" 
                            onClick={() => sifreGosterDegistir(!sifreGoster)} 
                            disabled={!seciliHariciSifreKimlik}
                            title='Şifreyi Göster'
                        />
                    </div>
                </Yukleniyor>
                <small className="block mt-1 text-xs text-color-secondary">
                    Şifreyi düzenlemek için Ayarlar -&gt; Gelişmiş Ayarlar menüsündeki Kasa sekmesini kullanın.
                </small>
            </div>
            { 
            aygitYonetici?.platformTipi() === PlatformTipi.CHROME && 
            <div className="p-field mb-3">
                <Yukleniyor tip='engelle'>
                    <Button 
                        type="button"
                        label='Şifreyi Doldur'
                        className='w-full p-button-primary' 
                        onClick={doldurTiklandi} 
                        disabled={!seciliHariciSifreKimlik}
                    />
                </Yukleniyor>
            </div>
            }
            <div className="formgrid grid mb-3">
                {/* Removed the entire "Şifreyi Sil" button column */}
            </div>
            <div className="flex justify-content-end">
                <div className="grid">
                    {
                    // TODO introjs eklenecek
                    false && <div className="field col">
                        <Button 
                            icon="pi pi-compass"
                            severity="help"
                            title='Rehber'
                        />
                    </div>
                    }
                    <div className="col">
                        <Yukleniyor tip='engelle'>
                            <Button 
                                type="button"
                                icon="pi pi-refresh"
                                onClick={yenileTiklandi}
                                className='h-full p-button-secondary'
                            />
                        </Yukleniyor>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnaEkranSifreler;
