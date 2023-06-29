import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { AygitYoneticiKullan, RootState, useAppDispatch } from "..";
import { useValidator } from "@validator.tool/hook";
import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import * as HariciSifreApi from '../ortak/HariciSifreApi';
import { useSelector } from "react-redux";
import { hashle, sifrele } from "../ortak/CryptoUtil";
import { kullaniciBelirle, mesajBelirle, sifirla, sifreGuncelDurumBelirle } from "../ortak/CodeyzerReducer";
import { confirmDialog } from "primereact/confirmdialog";
import { InputSwitch } from 'primereact/inputswitch';
import { MesajTipi } from "../ortak/BildirimMesaji";
import { useTranslation } from "react-i18next";

const AnaEkranAyarlar = () => {

    const kullanici = useSelector((state: RootState) => state.codeyzerDepoReducer.kullanici)!;
    const hariciSifreDesifreListesi = useSelector((state: RootState) => state.codeyzerDepoReducer.hariciSifreDesifreListesi);
    const [yeniAnaSifre, yeniAnaSifreDegistir] = useState<string>();
    const [sifreGoster, sifreGosterDegistir] = useState<boolean>(false);
    const [otomatikDoldurBilgi, otomatikDoldurBilgiDegistir] = useState<ReturnType<typeof otomatikDoldurBilgiGuncelle>>();
    const dispatch = useAppDispatch();
    const { validator, handleSubmit, forceUpdate } = useValidator({messagesShown: false});
    const { t } = useTranslation();
    const aygitYonetici = AygitYoneticiKullan();

    useEffect(() => {
        otomatikDoldurBilgiDegistir(otomatikDoldurBilgiGuncelle());
    }, []);

    const sifreDegistirTiklandi = () => {
        confirmDialog({
            message: 'Ana şifrenizi değiştirmek istediğinize emin misiniz?',
            header: 'Uyarı',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Onayla',
            rejectLabel: 'iptal',
            accept: async () => {
                if (!validator.allValid()) {
                    validator.showMessages();
                    forceUpdate();
                    return;
                }

                const yeniKullaniciKimlik = hashle(kullanici.kullaniciAdi + ':' + yeniAnaSifre);
                const yeniHariciSifreListesi = hariciSifreDesifreListesi
                    .map(hsd => ({
                        icerik: sifrele(JSON.stringify(hsd.icerik), yeniAnaSifre!)
                    }));
                
                const cevap = await HariciSifreApi.sifreleriYenile({
                    hariciSifreListesi: yeniHariciSifreListesi,
                    kullaniciKimlik: kullanici.kullaniciKimlik,
                    yeniKullaniciKimlik: yeniKullaniciKimlik
                });

                if (cevap.basarili) {
                    dispatch(kullaniciBelirle({
                        kullaniciKimlik: yeniKullaniciKimlik,
                        kullaniciAdi: kullanici.kullaniciAdi,
                        sifre: yeniAnaSifre!
                    }));

                    dispatch(sifreGuncelDurumBelirle(false));
                    dispatch(mesajBelirle({
                        tip: MesajTipi.BILGI,
                        icerik: 'Ana şifreniz değiştirildi'
                    }));
                }
            }
        });
    };

    const cikisYapTiklandi = () => {
        dispatch(sifirla());
    };

    const otomatikDoldurBilgiGuncelle = () => {
        return {
            etkin: true,
            destek: true
        };
    };

    const gelismisAyarlarTiklandi = () => {
        aygitYonetici?.sekmeAc('GelismisAyarlar');
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
                </div>
                <div className="field">
                    <Button type='button' label={t('anaEkranAyarlar.sifreYenile.label')}  className='w-full' onClick={sifreDegistirTiklandi} />
                </div>
                {
                // TODO şifre sor eklenecek
                false && <div className="field">
                    {t('anaEkranAyarlar.sifreSor.label')} <InputSwitch id='sifreSor' checked={true} onChange={(e) => {}} />
                </div>
                }
                <div className="field">
                    <Button
                        type='button' 
                        label={'Gelişmiş Ayarlar'} 
                        className='w-full' 
                        onClick={gelismisAyarlarTiklandi} 
                    />
                </div>
                <div className="field">
                    <Button 
                        label={otomatikDoldurBilgi?.etkin ? t('anaEkranAyarlar.otomatikDoldur.etkin') : otomatikDoldurBilgi?.destek ? t('anaEkranAyarlar.otomatikDoldur.etkinlestir') : t('anaEkranAyarlar.otomatikDoldur.desteklenmiyor')} 
                        severity="warning" 
                        className='w-full' 
                        disabled={otomatikDoldurBilgi?.etkin || !otomatikDoldurBilgi?.destek} 
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