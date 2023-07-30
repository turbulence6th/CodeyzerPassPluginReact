import { useEffect, useState } from "react";
import { sifrele } from "../ortak/CryptoUtil";
import { guncelle, kaydet } from "../ortak/HariciSifreApi";
import { HariciSifreDesifre, HariciSifreIcerik } from "../ortak/HariciSifreDTO";
import { InputText } from 'primereact/inputtext';
import { useSelector } from "react-redux";
import { AygitYoneticiKullan, RootState, useAppDispatch } from "..";
import { Button } from "primereact/button";
import { aktifAnaEkranTabBelirle, seciliHariciSifreKimlikBelirle, sifreGuncelDurumBelirle } from "../ortak/CodeyzerReducer";
import AnaEkranTabEnum from "./AnaEkranTabEnum";
import { useValidator } from "@validator.tool/hook";
import { classNames } from "primereact/utils";
import { useTranslation } from "react-i18next";
import { Dropdown } from "primereact/dropdown";
import AndroidPaketSecenek from "../ortak/AndroidPaketSecenek";
import PlatformTipi from "../ortak/PlatformTipi";

const VARSAYILAN_HARICI_SIFRE: HariciSifreIcerik = {
    platform: '',
    androidPaket: '',
    kullaniciAdi: '',
    sifre: ''
};

const AnaEkranSifreEkle = () => {
    
    const kullanici = useSelector((state: RootState) => state.codeyzerDepoReducer.kullanici)!;
    const seciliHariciSifreKimlik = useSelector((state: RootState) => state.codeyzerHafizaReducer.seciliHariciSifreKimlik);
    const hariciSifreDesifreListesi = useSelector((state: RootState) => state.codeyzerHafizaReducer.hariciSifreDesifreListesi);
    const [hariciSifreIcerik, hariciSifreIcerikDegistir] = useState<HariciSifreIcerik>(VARSAYILAN_HARICI_SIFRE);
    const [sifreGoster, sifreGosterDegistir] = useState<boolean>(false);
    const { validator, handleSubmit, forceUpdate } = useValidator({messagesShown: false});
    const aygitYonetici = AygitYoneticiKullan();
    const [androidPaketSecenekleri, androidPaketSecenekleriDegistir] = useState<AndroidPaketSecenek[]>([]);
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        const seciliHariciSifreDesifre = hariciSifreDesifreListesi.find(hsd => hsd.kimlik === seciliHariciSifreKimlik)
        if (seciliHariciSifreDesifre) {
            hariciSifreIcerikDegistir({
                ...seciliHariciSifreDesifre.icerik
            })
        }
    }, [seciliHariciSifreKimlik, hariciSifreDesifreListesi]);

    useEffect(() => {
        aygitYonetici?.androidPaketGetir()
        .then(androidPaketList => {
            androidPaketSecenekleriDegistir(androidPaketList);
        });
    }, [aygitYonetici]);

    const platformDegistir = (platform: string) => {
        hariciSifreIcerikDegistir({
            ...hariciSifreIcerik,
            platform
        });
    };

    const androidPaketDegistir = (androidPaket: string) => {
        hariciSifreIcerikDegistir({
            ...hariciSifreIcerik,
            androidPaket
        });
    };

    const kullaniciAdiDegistir = (kullaniciAdi: string) => {
        hariciSifreIcerikDegistir({
            ...hariciSifreIcerik,
            kullaniciAdi
        });
    };

    const sifreDegistir = (sifre: string) => {
        hariciSifreIcerikDegistir({
            ...hariciSifreIcerik,
            sifre
        });
    };
    
    const sifreEkleGuncelle = async () => {
        if (!validator.allValid()) {
            validator.showMessages();
            forceUpdate();
            return;
        }

        if (!seciliHariciSifreKimlik) {
            await kaydet({
                icerik: sifrele(JSON.stringify(hariciSifreIcerik), kullanici.sifre),
                kullaniciKimlik: kullanici.kullaniciKimlik
            });
        } else {
            await guncelle({
                kimlik: seciliHariciSifreKimlik,
                icerik: sifrele(JSON.stringify(hariciSifreIcerik), kullanici.sifre),
                kullaniciKimlik: kullanici.kullaniciKimlik
            });
        }

        dispatch(seciliHariciSifreKimlikBelirle(''));
        dispatch(sifreGuncelDurumBelirle(false));
        dispatch(aktifAnaEkranTabBelirle(AnaEkranTabEnum.SIFRELER));
    };

    const formuSifirla = () => {
        dispatch(seciliHariciSifreKimlikBelirle(''));
        hariciSifreIcerikDegistir(VARSAYILAN_HARICI_SIFRE);
        validator.hideMessages();
        forceUpdate();
    };

    const androidPaketSecenekleriGetir = () => {
        return aygitYonetici?.androidPaketGetir();
    };

    return (
        <div>
            <form 
                onSubmit={handleSubmit(sifreEkleGuncelle)}
            >
                <div className="field h-4rem">
                    <span className="p-float-label">
                        <InputText 
                            id="platform" 
                            value={hariciSifreIcerik.platform} 
                            onChange={(e) => platformDegistir(e.target.value)} 
                            className={classNames('w-full', {'p-invalid': validator.messagesShown && !validator.fieldValid('platform')})} 
                            inputMode='url'
                            aria-describedby="platform-mesaj"
                        />
                        <label htmlFor="platform">{t('anaEkranSifreEkle.platform.label')}</label>
                    </span>
                    <div id="platform-mesaj" className='hata text-xs pl-2'>
                    {
                        validator.message('platform', hariciSifreIcerik.platform, {
                            validate: (val: string) => !val ? 
                                t('anaEkranSifreEkle.platform.hata.gerekli') : ''
                        }) 
                        ||
                        validator.message('platform', hariciSifreIcerik.platform, {
                            validate: (val: string) => val && !/^(\w+\.)*(\w+\.\w+)\/.*$/.test(val) ? 
                                t('anaEkranSifreEkle.platform.hata.regex') : ''
                        }) 
                    }
                    </div>
                </div>
                <div className="field h-4rem">
                    <span className="p-float-label">
                        <InputText 
                            id="androidPaket" 
                            value={hariciSifreIcerik.androidPaket} 
                            onChange={(e) => androidPaketDegistir(e.target.value)} 
                            className={classNames('w-full', {'p-invalid': validator.messagesShown && !validator.fieldValid('androidPaket')})} 
                            aria-describedby="android-paket-mesaj"
                        />
                        <label htmlFor="androidPaket">{t('anaEkranSifreEkle.androidPaket.placeholder')}</label>
                    </span>
                    <small id="android-paket-mesaj" className='hata'>
                    {
                        validator.message('androidPaket', hariciSifreIcerik.androidPaket, {
                            validate: (val: string) => val && !/^(\w+\.)*\w+$/.test(val) ? 
                                "Android paket formatı android.paket.adi formatında olmalıdır" : ''
                        }) 
                    }
                    </small>
                </div>
                {
                aygitYonetici?.platformTipi() === PlatformTipi.ANDROID && <div className="field h-4rem">
                    <Dropdown 
                        value={androidPaketSecenekleri.some(androidPaketSecenek => androidPaketSecenek.value === hariciSifreIcerik.androidPaket) ? hariciSifreIcerik.androidPaket : undefined} 
                        onChange={(e) => androidPaketDegistir(e.value)} 
                        options={androidPaketSecenekleri} 
                        placeholder={'Android paket seçiniz'}
                        className="w-full" 
                        filter
                        filterInputAutoFocus={false}
                    />
                </div>
                }
                <div className="field h-4rem">
                    <span className="p-float-label">
                        <InputText 
                            id="kullaniciAdi" 
                            value={hariciSifreIcerik.kullaniciAdi} 
                            onChange={(e) => kullaniciAdiDegistir(e.target.value)} 
                            className={classNames('w-full', {'p-invalid': validator.messagesShown && !validator.fieldValid('kullaniciAdi')})} 
                            inputMode='email'
                            aria-describedby="kullanici-adi-mesaj"
                        />
                        <label htmlFor="kullaniciAdi">{t('anaEkranSifreEkle.kullaniciAdi.label')}</label>
                    </span>
                    <small id="kullanici-adi-mesaj" className='hata'>
                    {
                        validator.message('kullaniciAdi', hariciSifreIcerik.kullaniciAdi, {
                            validate: (val: string) => !val ? t('anaEkranSifreEkle.kullaniciAdi.hata.gerekli') : ''
                        }) 
                    }
                    </small>
                </div>
                <div className="field h-4rem">
                    <div className="p-inputgroup">
                        <span className="p-float-label">
                            <InputText 
                                id="sifre" 
                                type={sifreGoster ? 'text' : 'password'} 
                                value={hariciSifreIcerik.sifre} 
                                onChange={(e) => sifreDegistir(e.target.value)} 
                                className={classNames('w-full', {'p-invalid': validator.messagesShown && !validator.fieldValid('sifre')})} 
                                aria-describedby="sifre-mesaj"
                            />
                            <label htmlFor="sifre">{t('anaEkranSifreEkle.sifre.label')}</label>
                        </span>
                        <Button type="button" icon={"pi " + (sifreGoster ? "pi-eye" : "pi-eye-slash")} className="p-button-success" onClick={() => sifreGosterDegistir(!sifreGoster)} />
                    </div>
                    <small id="sifre-mesaj" className='hata'>
                    {
                        validator.message('sifre', hariciSifreIcerik.sifre, {
                            validate: (val: string) => !val ? t('anaEkranSifreEkle.sifre.hata.gerekli') : ''
                        }) 
                    }
                    </small>
                </div>
                <div className="field">
                    <Button type="button" label={seciliHariciSifreKimlik ? t('anaEkranSifreEkle.sifreEkle.guncelle.label') : t('anaEkranSifreEkle.sifreEkle.ekle.label')} className='w-full' onClick={sifreEkleGuncelle} />
                </div>
                <div className="field">
                    <Button type="button" label={t('anaEkranSifreEkle.sifirla.label')} className='w-full' onClick={formuSifirla} />
                </div>
            </form>
        </div>

        /*
        <form autoComplete="off">

            <div className="form-group">
                <CodeyzerDropdown  
                    options={[]}
                    selected={androidPackage}
                    emptyText='android'
                    onChange={setAndroidPackage}
                />
            </div>
           
        </form>
        */
    );
}

export default AnaEkranSifreEkle;