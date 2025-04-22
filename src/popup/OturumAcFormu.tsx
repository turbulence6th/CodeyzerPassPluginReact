// Oturum Açma Formu Bileşeni
import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useValidator } from '@validator.tool/hook';
import { classNames } from 'primereact/utils';

interface OturumAcFormuProps {
    onSubmit: (kullaniciAdi: string, sifre: string) => Promise<void>;
}

const OturumAcFormu: React.FC<OturumAcFormuProps> = ({ onSubmit }) => {
    const [kullaniciAdi, kullaniciAdiDegistir] = useState<string>('');
    const [sifre, sifreDegistir] = useState<string>('');
    const [sifreGoster, sifreGosterDegistir] = useState<boolean>(false);
    
    const { validator, handleSubmit, forceUpdate } = useValidator({ messagesShown: false });

    const handleLocalSubmit = () => {
        if (!validator.allValid()) {
            validator.showMessages();
            forceUpdate();
            return;
        }
        onSubmit(kullaniciAdi, sifre);
    };

    return (
        <form onSubmit={handleSubmit(handleLocalSubmit)} className='mt-3'>
            <div className="p-field mb-3">
                <span className="p-float-label">
                    <InputText 
                        id="loginKullaniciAdi"
                        value={kullaniciAdi} 
                        onChange={(e) => kullaniciAdiDegistir(e.target.value)} 
                        className={classNames('w-full', {'p-invalid': validator.messagesShown && !validator.fieldValid('kullaniciAdi')})} 
                        aria-describedby="loginKullaniciAdi-mesaj"
                    />
                    <label htmlFor="loginKullaniciAdi">Kullanıcı Adı</label>
                </span>
                <small id="loginKullaniciAdi-mesaj" className='p-error' style={{ minHeight: '1.2em', display: 'block' }}>
                {
                    validator.message('kullaniciAdi', kullaniciAdi, {
                        validate: (val: string) => !val ? 'Kullanıcı adı gerekli' : ''
                    }) 
                }
                </small>
            </div>
            <div className="p-field mb-3">
                <div className='p-inputgroup'>
                    <span className="p-float-label">
                        <InputText 
                            id="loginSifre" 
                            type={sifreGoster ? 'text' : 'password'} 
                            value={sifre} 
                            onChange={(e) => sifreDegistir(e.target.value)} 
                            className={classNames('w-full', {'p-invalid': validator.messagesShown && !validator.fieldValid('sifre')})} 
                            aria-describedby="loginSifre-mesaj"
                        />
                        <label htmlFor="loginSifre">Şifre</label>
                    </span>
                    <Button type='button' icon={"pi " + (sifreGoster ? "pi-eye" : "pi-eye-slash")} className="p-button-success" onClick={() => sifreGosterDegistir(!sifreGoster)} />
                </div>
                <small id="loginSifre-mesaj" className='p-error' style={{ minHeight: '1.2em', display: 'block' }}>
                {
                    validator.message('sifre', sifre, {
                        validate: (val: string) => !val ? 'Şifre gerekli' : ''
                    }) 
                }
                </small>
            </div>
            <div className="p-field mb-3">
                <Button 
                    type='submit' 
                    label='Oturum Aç'
                    className='w-full' 
                />
            </div>
        </form>
    );
};

export default OturumAcFormu; 