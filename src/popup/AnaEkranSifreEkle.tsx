import { useEffect, useState } from "react";
import { deriveAesKey, encryptWithAES, generateIV, uint8ArrayToBase64 } from "../ortak/CryptoUtil";
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
import Yukleniyor from "../ortak/Yukleniyor";
import { HariciSifreHariciSifreData, HariciSifreMetadata } from "../ortak/HariciSifreDTO";
import { HariciSifreApi } from "../ortak/HariciSifreApi";

interface HariciSifreEkleForm {
    url: string;
    android: string;
    kullaniciAdi: string;
    sifre: string;
}

const VARSAYILAN_HARICI_SIFRE : HariciSifreEkleForm = {
    url: '',
    android: '',
    kullaniciAdi: '',
    sifre: ''
};

const AnaEkranSifreEkle = () => {
    
    const kullanici = useSelector((state: RootState) => state.codeyzerDepoReducer.kullanici)!;
    const sifre = useSelector((state: RootState) => state.codeyzerHafizaReducer.sifre);
    const seciliHariciSifreKimlik = useSelector((state: RootState) => state.codeyzerHafizaReducer.seciliHariciSifreKimlik);
    const hariciSifreDesifreListesi = useSelector((state: RootState) => state.codeyzerHafizaReducer.hariciSifreDesifreListesi);
    const [hariciSifreEkleForm, hariciSifreEkleFormDegistir] = useState<HariciSifreEkleForm>(VARSAYILAN_HARICI_SIFRE);
    const [sifreGoster, sifreGosterDegistir] = useState<boolean>(false);
    const { validator, handleSubmit, forceUpdate } = useValidator({messagesShown: false});
    const aygitYonetici = AygitYoneticiKullan();
    const [androidPaketSecenekleri, androidPaketSecenekleriDegistir] = useState<AndroidPaketSecenek[]>([]);
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        const seciliHariciSifreDesifre = hariciSifreDesifreListesi.find(hsd => hsd.id === seciliHariciSifreKimlik)
        if (seciliHariciSifreDesifre) {
            hariciSifreEkleFormDegistir({
                ...seciliHariciSifreDesifre.data,
                ...seciliHariciSifreDesifre.metadata
            })
        }
    }, [seciliHariciSifreKimlik, hariciSifreDesifreListesi]);

    useEffect(() => {
        aygitYonetici?.androidPaketGetir()
        .then(androidPaketList => {
            androidPaketSecenekleriDegistir(androidPaketList);
        });

        aygitYonetici?.depodanGetir('login').then(loginJson => {
            if (loginJson) {
                const login: {platform: string, kullaniciAdi: string, sifre: string} = JSON.parse(loginJson);
                hariciSifreEkleFormDegistir({
                    ...hariciSifreEkleForm,
                    url: login.platform,
                    kullaniciAdi: login.kullaniciAdi,
                    sifre: login.sifre
                });
                aygitYonetici.depodanSil('login');
            } 
        })

        aygitYonetici?.platformGetir().then(cevap => {
            if (!seciliHariciSifreKimlik) {
                hariciSifreEkleFormDegistir({
                    ...hariciSifreEkleForm,
                    url: cevap.platform,
                    android: cevap.androidPaket
                });
            }
        });
    }, [aygitYonetici]);

    const urlDegistir = (url: string) => {
        hariciSifreEkleFormDegistir({
            ...hariciSifreEkleForm,
            url
        });
    };

    const androidPaketDegistir = (androidPaket: string) => {
        hariciSifreEkleFormDegistir({
            ...hariciSifreEkleForm,
            android: androidPaket
        });
    };

    const kullaniciAdiDegistir = (kullaniciAdi: string) => {
        hariciSifreEkleFormDegistir({
            ...hariciSifreEkleForm,
            kullaniciAdi
        });
    };

    const sifreDegistir = (sifre: string) => {
        hariciSifreEkleFormDegistir({
            ...hariciSifreEkleForm,
            sifre
        });
    };
    
    const sifreEkleGuncelle = async () => {
        if (!validator.allValid()) {
            validator.showMessages();
            forceUpdate();
            return;
        }

        const iv = generateIV();
        const aesKey = await deriveAesKey(sifre, kullanici.kullaniciKimlik);
        const encryptedData = await encryptWithAES(aesKey, JSON.stringify({ 
            kullaniciAdi: hariciSifreEkleForm.kullaniciAdi, 
            sifre: hariciSifreEkleForm.sifre
        } as HariciSifreHariciSifreData), iv);

        const encryptedMetadata = await encryptWithAES(aesKey, JSON.stringify({ 
            url: hariciSifreEkleForm.url, 
            android: hariciSifreEkleForm.android
        } as HariciSifreMetadata), iv);

        if (!seciliHariciSifreKimlik) {
            await HariciSifreApi.save({
                id: crypto.randomUUID(),
                encryptedData,
                encryptedMetadata,
                aesIV: uint8ArrayToBase64(iv),
            });
        } else {
            await HariciSifreApi.update(seciliHariciSifreKimlik, {
                encryptedData,
                encryptedMetadata,
                aesIV: uint8ArrayToBase64(iv),
            });
        }

        dispatch(seciliHariciSifreKimlikBelirle(''));
        dispatch(sifreGuncelDurumBelirle(false));
        dispatch(aktifAnaEkranTabBelirle(AnaEkranTabEnum.SIFRELER));
    };

    const formuSifirla = () => {
        dispatch(seciliHariciSifreKimlikBelirle(''));
        hariciSifreEkleFormDegistir(VARSAYILAN_HARICI_SIFRE);
        validator.hideMessages();
        forceUpdate();
    };

    return (
        <div>
            <form 
                onSubmit={handleSubmit(sifreEkleGuncelle)}
            >
                <div className="field h-4rem">
                    <Yukleniyor tip="engelle">
                        <span className="p-float-label">
                            <InputText 
                                id="url" 
                                value={hariciSifreEkleForm.url} 
                                onChange={(e) => urlDegistir(e.target.value)} 
                                className={classNames('w-full', {'p-invalid': validator.messagesShown && !validator.fieldValid('url')})} 
                                inputMode='url'
                                aria-describedby="url-mesaj"
                            />
                            <label htmlFor="url">Url</label>
                        </span>
                    </Yukleniyor>
                </div>
                <div className="field h-4rem">
                    <Yukleniyor tip="engelle">
                        <span className="p-float-label">
                            <InputText 
                                id="androidPaket" 
                                value={hariciSifreEkleForm.android} 
                                onChange={(e) => androidPaketDegistir(e.target.value)} 
                                className={classNames('w-full', {'p-invalid': validator.messagesShown && !validator.fieldValid('androidPaket')})} 
                                aria-describedby="android-paket-mesaj"
                            />
                            <label htmlFor="androidPaket">{t('anaEkranSifreEkle.androidPaket.placeholder')}</label>
                        </span>
                        <small id="android-paket-mesaj" className='hata'>
                        {
                            validator.message('androidPaket', hariciSifreEkleForm.android, {
                                validate: (val: string) => val && !/^(\w+\.)*\w+$/.test(val) ? 
                                    "Android paket formatı android.paket.adi formatında olmalıdır" : ''
                            }) 
                        }
                        </small>
                    </Yukleniyor>
                </div>
                {
                aygitYonetici?.platformTipi() === PlatformTipi.ANDROID && <div className="field h-4rem">
                    <Yukleniyor tip="engelle">
                        <Dropdown 
                            value={androidPaketSecenekleri.some(androidPaketSecenek => androidPaketSecenek.value === hariciSifreEkleForm.android) ? hariciSifreEkleForm.android : undefined} 
                            onChange={(e) => androidPaketDegistir(e.value)} 
                            options={androidPaketSecenekleri} 
                            placeholder={'Android paket seçiniz'}
                            className="w-full" 
                            filter
                            filterInputAutoFocus={false}
                        />
                    </Yukleniyor>
                </div>
                }
                <div className="field h-4rem">
                    <Yukleniyor tip="engelle">
                        <span className="p-float-label">
                            <InputText 
                                id="kullaniciAdi" 
                                value={hariciSifreEkleForm.kullaniciAdi} 
                                onChange={(e) => kullaniciAdiDegistir(e.target.value)} 
                                className={classNames('w-full', {'p-invalid': validator.messagesShown && !validator.fieldValid('kullaniciAdi')})} 
                                inputMode='email'
                                aria-describedby="kullanici-adi-mesaj"
                            />
                            <label htmlFor="kullaniciAdi">{t('anaEkranSifreEkle.kullaniciAdi.label')}</label>
                        </span>
                        <small id="kullanici-adi-mesaj" className='hata'>
                        {
                            validator.message('kullaniciAdi', hariciSifreEkleForm.kullaniciAdi, {
                                validate: (val: string) => !val ? t('anaEkranSifreEkle.kullaniciAdi.hata.gerekli') : ''
                            }) 
                        }
                        </small>
                    </Yukleniyor>
                </div>
                <div className="field h-4rem">
                    <Yukleniyor tip="engelle">
                        <div className="p-inputgroup">
                            <span className="p-float-label">
                                <InputText 
                                    id="sifre" 
                                    type={sifreGoster ? 'text' : 'password'} 
                                    value={hariciSifreEkleForm.sifre} 
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
                            validator.message('sifre', hariciSifreEkleForm.sifre, {
                                validate: (val: string) => !val ? t('anaEkranSifreEkle.sifre.hata.gerekli') : ''
                            }) 
                        }
                        </small>
                    </Yukleniyor>
                </div>
                <div className="field">
                    <Yukleniyor tip="engelle">
                        <Button type="button" label={seciliHariciSifreKimlik ? t('anaEkranSifreEkle.sifreEkle.guncelle.label') : t('anaEkranSifreEkle.sifreEkle.ekle.label')} className='w-full' onClick={sifreEkleGuncelle} />
                    </Yukleniyor>
                </div>
                <div className="field">
                    <Yukleniyor tip="engelle">
                        <Button type="button" label={t('anaEkranSifreEkle.sifirla.label')} className='w-full' onClick={formuSifirla} />
                    </Yukleniyor>
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