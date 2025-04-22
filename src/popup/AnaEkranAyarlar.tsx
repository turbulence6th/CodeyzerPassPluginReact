import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { AygitYoneticiKullan, RootState, useAppDispatch } from "..";
import { useValidator } from "@validator.tool/hook";
import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { useSelector } from "react-redux";
import { InputSwitch } from 'primereact/inputswitch';
import PlatformTipi from "../types/PlatformTipi";
import { dialogGoster } from "../utils/DialogUtil";
import Yukleniyor from "../components/Yukleniyor";
import { sifirla, urlBelirle } from "../store/CodeyzerReducer";

const AnaEkranAyarlar = () => {

    const kullanici = useSelector((state: RootState) => state.codeyzerDepoReducer.kullanici)!;
    const url = useSelector((state: RootState) => state.codeyzerDepoReducer.url);
    const [otomatikDoldurBilgi, otomatikDoldurBilgiDegistir] = useState<{etkin: boolean, destek: boolean}>();
    const dispatch = useAppDispatch();
    const aygitYonetici = AygitYoneticiKullan();

    useEffect(() => {
        otomatikDoldurBilgiGuncelle();
    }, [aygitYonetici]);

    const otomatikDoldurBilgiGuncelle = async () => {
       otomatikDoldurBilgiDegistir(await aygitYonetici?.otomatikDoldurBilgi());
    }

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
            >
                <div className="p-field mb-3">
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
                {
                aygitYonetici?.platformTipi() !== PlatformTipi.ANDROID && 
                <div className="p-field mb-3">
                    <Button
                        type='button' 
                        label='Gelişmiş Ayarlar'
                        className='w-full p-button-secondary' 
                        onClick={gelismisAyarlarTiklandi} 
                    />
                </div>
                }
                <div className="p-field mb-3">
                    <Button 
                        type='button'
                        label={otomatikDoldurBilgi?.etkin ? 'Otomatik Doldurma Etkin' : otomatikDoldurBilgi?.destek ? 'Otomatik Doldurmayı Etkinleştir' : 'Otomatik Doldurma Desteklenmiyor'}
                        severity="warning" 
                        className='w-full' 
                        disabled={otomatikDoldurBilgi?.etkin || !otomatikDoldurBilgi?.destek} 
                        onClick={otomatikDoldurEtkinlestir}
                    />
                </div>
                <div className="p-field">
                    <Button
                        type='button' 
                        label='Çıkış Yap'
                        className='w-full p-button-danger p-button-outlined' 
                        onClick={cikisYapTiklandi} 
                    />
                </div>
            </form>
        </div>
    )
};

export default AnaEkranAyarlar;