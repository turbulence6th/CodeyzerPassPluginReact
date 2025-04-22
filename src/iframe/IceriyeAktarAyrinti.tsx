import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { HariciSifreDesifreIceriyeAktar } from "./IceriyeAktar";
import { useState } from "react";

interface IceriyeAktarAyrintiProps {
    hariciSifreDesifreIceriAktar?: HariciSifreDesifreIceriyeAktar
}

const IceriyeAktarAyrinti = ({ hariciSifreDesifreIceriAktar }: IceriyeAktarAyrintiProps) => {

    const [sifreGoster, sifreGosterDegistir] = useState(false);

    return (
        <div>
            <div className="p-field mb-3">
                <span className="p-float-label">
                    <InputText 
                        id="url" 
                        value={hariciSifreDesifreIceriAktar?.metadata.url || ''} 
                        className='w-full'
                        inputMode='url'
                        aria-describedby="url-mesaj"
                        disabled
                    />
                    <label htmlFor="url">Url</label>
                </span>
            </div>
            <div className="p-field mb-3">
                <span className="p-float-label">
                    <InputText 
                        id="androidPaket" 
                        value={hariciSifreDesifreIceriAktar?.metadata.android || ''} 
                        className='w-full'
                        aria-describedby="android-paket-mesaj"
                        disabled
                    />
                    <label htmlFor="androidPaket">Android Paket</label>
                </span>
            </div>
            <div className="p-field mb-3">
                <span className="p-float-label">
                    <InputText 
                        id="kullaniciAdi" 
                        value={hariciSifreDesifreIceriAktar?.data.kullaniciAdi || ''}  
                        className='w-full' 
                        inputMode='email'
                        aria-describedby="kullanici-adi-mesaj"
                        disabled
                    />
                    <label htmlFor="kullaniciAdi">Kullanıcı Adı</label>
                </span>
            </div>
            <div className="p-field mb-3">
                <div className="p-inputgroup">
                    <span className="p-float-label">
                        <InputText 
                            id="sifre" 
                            type={sifreGoster ? 'text' : 'password'} 
                            value={hariciSifreDesifreIceriAktar?.data.sifre || ''} 
                            className='w-full' 
                            aria-describedby="sifre-mesaj"
                            disabled
                        />
                        <label htmlFor="sifre">Şifre</label>
                    </span>
                    <Button type="button" icon={"pi " + (sifreGoster ? "pi-eye" : "pi-eye-slash")} className="p-button-secondary p-button-outlined" onClick={() => sifreGosterDegistir(!sifreGoster)} />
                </div>
            </div>
        </div>
    );
}

export default IceriyeAktarAyrinti;