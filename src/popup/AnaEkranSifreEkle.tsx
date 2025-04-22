import { useEffect, useState } from "react";
import { deriveAesKey, encryptWithAES, generateIV, uint8ArrayToBase64 } from "../utils/CryptoUtil";
import { InputText } from 'primereact/inputtext';
import { useSelector } from "react-redux";
import { AygitYoneticiKullan, RootState, useAppDispatch } from "..";
import { Button } from "primereact/button";
import { aktifAnaEkranTabBelirle, seciliHariciSifreKimlikBelirle, sifreGuncelDurumBelirle } from "../store/CodeyzerReducer";
import AnaEkranTabEnum from "./AnaEkranTabEnum";
import { useValidator } from "@validator.tool/hook";
import { classNames } from "primereact/utils";
import { Dropdown } from "primereact/dropdown";
import AndroidPaketSecenek from "../types/AndroidPaketSecenek";
import PlatformTipi from "../types/PlatformTipi";
import Yukleniyor from "../components/Yukleniyor";
import { HariciSifreHariciSifreData, HariciSifreMetadata } from "../types/HariciSifreDTO";
import { HariciSifreApi } from "../services/HariciSifreApi";

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

    const vazgecTiklandi = () => {
        dispatch(aktifAnaEkranTabBelirle(AnaEkranTabEnum.SIFRELER));
        dispatch(seciliHariciSifreKimlikBelirle(''));
        validator.hideMessages();
        forceUpdate();
    };

    return (
        <div>
            <form 
                onSubmit={handleSubmit(sifreEkleGuncelle)}
            >
                <div className="p-field mb-3">
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
                        <small id="url-mesaj" className='p-error' style={{ minHeight: '1.2em', display: 'block' }}>
                        {
                            validator.message('url', hariciSifreEkleForm.url, {
                                validate: (val: string) => !val ? 'Url gerekli' : ''
                            }) 
                        }
                        </small>
                    </Yukleniyor>
                </div>
                <div className="p-field mb-3">
                    <Yukleniyor tip="engelle">
                        <span className="p-float-label">
                            <InputText 
                                id="androidPaket" 
                                value={hariciSifreEkleForm.android} 
                                onChange={(e) => androidPaketDegistir(e.target.value)} 
                                className={classNames('w-full', {'p-invalid': validator.messagesShown && !validator.fieldValid('androidPaket')})} 
                                aria-describedby="android-paket-mesaj"
                            />
                            <label htmlFor="androidPaket">Android Paket Adı</label>
                        </span>
                        <small id="android-paket-mesaj" className='p-error' style={{ minHeight: '1.2em', display: 'block' }}>
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
                aygitYonetici?.platformTipi() === PlatformTipi.ANDROID && <div className="p-field mb-3">
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
                <div className="p-field mb-3">
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
                            <label htmlFor="kullaniciAdi">Kullanıcı Adı</label>
                        </span>
                        <small id="kullanici-adi-mesaj" className='p-error' style={{ minHeight: '1.2em', display: 'block' }}>
                        {
                            validator.message('kullaniciAdi', hariciSifreEkleForm.kullaniciAdi, {
                                validate: (val: string) => !val ? 'Kullanıcı adı gerekli' : ''
                            }) 
                        }
                        </small>
                    </Yukleniyor>
                </div>
                <div className="p-field mb-3">
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
                                <label htmlFor="sifre">Şifre</label>
                            </span>
                            <Button type="button" icon={"pi " + (sifreGoster ? "pi-eye" : "pi-eye-slash")} className="p-button-secondary p-button-outlined" onClick={() => sifreGosterDegistir(!sifreGoster)} />
                        </div>
                        <small id="sifre-mesaj" className='p-error' style={{ minHeight: '1.2em', display: 'block' }}>
                        {
                            validator.message('sifre', hariciSifreEkleForm.sifre, {
                                validate: (val: string) => !val ? 'Şifre gerekli' : ''
                            }) 
                        }
                        </small>
                    </Yukleniyor>
                </div>
                <div className="p-field mb-3">
                    <Yukleniyor tip="engelle">
                        <Button 
                            type='button'
                            label={seciliHariciSifreKimlik ? 'Güncelle' : 'Ekle'}
                            className='w-full p-button-primary' 
                            onClick={sifreEkleGuncelle}
                        />
                    </Yukleniyor>
                </div>
                {seciliHariciSifreKimlik && (
                    <div className="p-field">
                        <Yukleniyor tip="engelle">
                            <Button 
                                type='button' 
                                label='Vazgeç'
                                className='w-full p-button-secondary' 
                                onClick={vazgecTiklandi}
                            />
                        </Yukleniyor>
                    </div>
                )}
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