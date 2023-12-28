import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { HariciSifreDesifreIceriyeAktar } from "./IceriyeAktar";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface IceriyeAktarAyrintiProps {
    hariciSifreDesifreIceriAktar?: HariciSifreDesifreIceriyeAktar
}

const IceriyeAktarAyrinti = ({ hariciSifreDesifreIceriAktar }: IceriyeAktarAyrintiProps) => {

    const [sifreGoster, sifreGosterDegistir] = useState(false);
    const { t } = useTranslation();

    return (
        <div>
            <div className="field h-4rem">
                <span className="p-float-label">
                    <InputText 
                        id="platform" 
                        value={hariciSifreDesifreIceriAktar?.icerik.platform || ''} 
                        className='w-full'
                        inputMode='url'
                        aria-describedby="platform-mesaj"
                        disabled
                    />
                    <label htmlFor="platform">{t('anaEkranSifreEkle.platform.label')}</label>
                </span>
            </div>
            <div className="field h-4rem">
                <span className="p-float-label">
                    <InputText 
                        id="androidPaket" 
                        value={hariciSifreDesifreIceriAktar?.icerik.androidPaket || ''} 
                        className='w-full'
                        aria-describedby="android-paket-mesaj"
                        disabled
                    />
                    <label htmlFor="androidPaket">{t('anaEkranSifreEkle.androidPaket.placeholder')}</label>
                </span>
            </div>
            <div className="field h-4rem">
                <span className="p-float-label">
                    <InputText 
                        id="kullaniciAdi" 
                        value={hariciSifreDesifreIceriAktar?.icerik.kullaniciAdi || ''}  
                        className='w-full' 
                        inputMode='email'
                        aria-describedby="kullanici-adi-mesaj"
                        disabled
                    />
                    <label htmlFor="kullaniciAdi">{t('anaEkranSifreEkle.kullaniciAdi.label')}</label>
                </span>
            </div>
            <div className="field h-4rem">
                <div className="p-inputgroup">
                    <span className="p-float-label">
                        <InputText 
                            id="sifre" 
                            type={sifreGoster ? 'text' : 'password'} 
                            value={hariciSifreDesifreIceriAktar?.icerik.sifre || ''} 
                            className='w-full' 
                            aria-describedby="sifre-mesaj"
                            disabled
                        />
                        <label htmlFor="sifre">{t('anaEkranSifreEkle.sifre.label')}</label>
                    </span>
                    <Button type="button" icon={"pi " + (sifreGoster ? "pi-eye" : "pi-eye-slash")} className="p-button-success" onClick={() => sifreGosterDegistir(!sifreGoster)} />
                </div>
            </div>
        </div>
    );
}

export default IceriyeAktarAyrinti;