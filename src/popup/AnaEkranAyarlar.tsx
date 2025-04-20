import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { AygitYoneticiKullan, RootState, useAppDispatch } from "..";
import { useValidator } from "@validator.tool/hook";
import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { useSelector } from "react-redux";
import { InputSwitch } from 'primereact/inputswitch';
import { useTranslation } from "react-i18next";
import PlatformTipi from "../ortak/PlatformTipi";
import { dialogGoster } from "../ortak/DialogUtil";
import Yukleniyor from "../ortak/Yukleniyor";
import { sifirla, urlBelirle } from "../ortak/CodeyzerReducer";

const AnaEkranAyarlar = () => {

    const kullanici = useSelector((state: RootState) => state.codeyzerDepoReducer.kullanici)!;
    const hariciSifreDesifreListesi = useSelector((state: RootState) => state.codeyzerHafizaReducer.hariciSifreDesifreListesi);
    const url = useSelector((state: RootState) => state.codeyzerDepoReducer.url);
    const [yeniAnaSifre, yeniAnaSifreDegistir] = useState<string>();
    const [sifreGoster, sifreGosterDegistir] = useState<boolean>(false);
    const [otomatikDoldurBilgi, otomatikDoldurBilgiDegistir] = useState<{etkin: boolean, destek: boolean}>();
    const dispatch = useAppDispatch();
    const { validator, handleSubmit, forceUpdate } = useValidator({messagesShown: false});
    const { t } = useTranslation();
    const aygitYonetici = AygitYoneticiKullan();

    useEffect(() => {
        otomatikDoldurBilgiGuncelle();
    }, [aygitYonetici]);

    const otomatikDoldurBilgiGuncelle = async () => {
       otomatikDoldurBilgiDegistir(await aygitYonetici?.otomatikDoldurBilgi());
    }

    const sifreDegistirTiklandi = () => {
        dialogGoster(t, t('codeyzer.genel.uyari'), t('anaEkranAyarlar.sifreYenile.click'),
            async () => {
                if (!validator.allValid()) {
                    validator.showMessages();
                    forceUpdate();
                    return;
                }

                /** 
                const yeniHariciSifreListesi = hariciSifreDesifreListesi
                    .map(hsd => ({
                        icerik: sifrele(JSON.stringify(hsd.icerik), yeniAnaSifre!)
                    }));
                
                const cevap = await HariciSifreApi.sifreleriYenile({
                    hariciSifreListesi: yeniHariciSifreListesi,
                    kullaniciKimlik: kullanici.kullaniciKimlik,
                });

                if (cevap.basarili) {
                    dispatch(kullaniciBelirle({
                        kullaniciKimlik: kullanici.kullaniciKimlik,
                        kullaniciAdi: kullanici.kullaniciAdi,
                        sifreHash: await hash(yeniAnaSifre!)
                    }));

                    dispatch(sifreGuncelDurumBelirle(false));
                    dispatch(mesajBelirle({
                        tip: MesajTipi.BILGI,
                        icerik: 'Ana şifreniz değiştirildi'
                    }));
                    
                }
                */
            }
        );
    };

    const cikisYapTiklandi = () => {
        dispatch(sifirla());
    };

    const gelismisAyarlarTiklandi = () => {
        aygitYonetici?.sekmeAc('GelismisAyarlar');
    }

    const otomatikDoldurEtkinlestir = async () => {
        await aygitYonetici?.otomatikDoldurEtkinlestir();
        otomatikDoldurBilgiGuncelle();
    }

    const urlDegistir = (yeniUrl: string) => {
        dispatch(urlBelirle(yeniUrl));
    }

    return (
        <div>
            <form 
                className='mt-3'
                onSubmit={handleSubmit(sifreDegistirTiklandi)}
            >
                <div className="field h-4rem">
                    <div className='p-inputgroup'>
                        <span className="p-float-label">
                            <InputText 
                                id="url" 
                                type='text' 
                                value={url} 
                                onChange={(e) => urlDegistir(e.target.value)} 
                                className={classNames('w-full')} 
                            />
                            <label htmlFor="url">Url</label>
                        </span>
                    </div>
                </div>
                <div className="field h-4rem">
                   <Yukleniyor tip="engelle">
                    <div className='p-inputgroup'>
                            <span className="p-float-label">
                                <InputText 
                                    id="sifre" 
                                    type={sifreGoster ? 'text' : 'password'} 
                                    value={yeniAnaSifre} 
                                    onChange={(e) => yeniAnaSifreDegistir(e.target.value)} 
                                    className={classNames('w-full', {'p-invalid': validator.messagesShown && !validator.fieldValid('yeniAnaSifre')})} 
                                    aria-describedby="sifre-mesaj"
                                />
                                <label htmlFor="sifre">{t('anaEkranAyarlar.yeniSifre.label')}</label>
                            </span>
                            <Button type='button' icon={"pi " + (sifreGoster ? "pi-eye" : "pi-eye-slash")} className="p-button-success" onClick={() => sifreGosterDegistir(!sifreGoster)} />
                        </div>
                        <small id="sifre-mesaj" className='hata'>
                        {
                            validator.message('yeniAnaSifre', yeniAnaSifre, {
                                validate: (val: string) => !val ? t('anaEkranAyarlar.yeniSifre.hata.gerekli') : ''
                            }) 
                            ||
                            validator.message('yeniAnaSifre', yeniAnaSifre, {
                                validate: (val: string) => !val ? t('anaEkranAyarlar.yeniSifre.hata.gerekli') : ''
                            }) 
                        }
                        </small>
                   </Yukleniyor>
                </div>
                <div className="field">
                    <Yukleniyor tip="engelle">
                        <Button type='button' label={t('anaEkranAyarlar.sifreYenile.label')}  className='w-full' onClick={sifreDegistirTiklandi} />
                    </Yukleniyor>
                </div>
                {
                // TODO şifre sor eklenecek
                false && <div className="field">
                    {t('anaEkranAyarlar.sifreSor.label')} <InputSwitch id='sifreSor' checked={true} onChange={(e) => {}} />
                </div>
                }
                {
                aygitYonetici?.platformTipi() !== PlatformTipi.ANDROID && <div className="field">
                    <Button
                        type='button' 
                        label={t('anaEkranAyarlar.otomatikDoldur.gelismisAyarlar.label')} 
                        className='w-full' 
                        onClick={gelismisAyarlarTiklandi} 
                    />
                </div>
                }
                <div className="field">
                    <Button 
                        type='button'
                        label={otomatikDoldurBilgi?.etkin ? t('anaEkranAyarlar.otomatikDoldur.etkin') : otomatikDoldurBilgi?.destek ? t('anaEkranAyarlar.otomatikDoldur.etkinlestir') : t('anaEkranAyarlar.otomatikDoldur.desteklenmiyor')} 
                        severity="warning" 
                        className='w-full' 
                        disabled={otomatikDoldurBilgi?.etkin || !otomatikDoldurBilgi?.destek} 
                        onClick={otomatikDoldurEtkinlestir}
                    />
                </div>
                <div className="field">
                    <Button
                        type='button' 
                        label={t('anaEkranAyarlar.cikisYap.label')} 
                        className='w-full' 
                        onClick={cikisYapTiklandi} 
                    />
                </div>
            </form>
        </div>
    )
};

export default AnaEkranAyarlar;