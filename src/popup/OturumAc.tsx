import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { AygitYoneticiKullan, RootState, useAppDispatch } from '..';
import { sifreBelirle, sifreGuncelDurumBelirle, urlBelirle } from '../ortak/CodeyzerReducer';
import { useValidator } from '@validator.tool/hook';
import { classNames } from 'primereact/utils';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { bcryptHash, sha512, vaultIdOlustur } from '../ortak/CryptoUtil';
import { KullaniciApi } from '../ortak/KullaniciApi';
import { kullaniciBelirle } from '../ortak/CodeyzerReducer';

const VAULT_SALT = "MIe8zZCjXgOe0QG5mJ0zRmYdjN7UnbACVjCkU7oPfJ0=";

const OturumAc = () => {
    
    const url = useSelector((state: RootState) => state.codeyzerDepoReducer.url);
    const [kullaniciAdi, kullaniciAdiDegistir] = useState<string>('');
    const [sifre, sifreDegistir] = useState<string>('');
    const [sifreGoster, sifreGosterDegistir] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const { validator, handleSubmit, forceUpdate } = useValidator({messagesShown: false});
    const { t } = useTranslation();
    const aygitYonetici = AygitYoneticiKullan();

    const oturumAc = async () => {
        const kullaniciKimlik = await vaultIdOlustur(kullaniciAdi, sifre, VAULT_SALT);
        const sifreHash = await sha512(sifre);

        const { accessToken, refreshToken } = await KullaniciApi.login({
            kullaniciKimlik,
            sifreHash
        });

        dispatch(kullaniciBelirle({
            kullaniciKimlik,
            sifreHash: await bcryptHash(sifre),
            accessToken,
            refreshToken
        }));
        aygitYonetici?.anaSifreKaydet(sifre);
        dispatch(sifreBelirle(sifre));
        dispatch(sifreGuncelDurumBelirle(false));
    };

    const kayitOl = async () => {
        if (!validator.allValid()) {
            validator.showMessages();
            forceUpdate();
            return;
        }

        const kullaniciKimlik = await vaultIdOlustur(kullaniciAdi, sifre, VAULT_SALT);
        const sifreHash = await sha512(sifre);

        const { accessToken, refreshToken } = await KullaniciApi.register({
            kullaniciKimlik,
            sifreHash
        });

        dispatch(kullaniciBelirle({
            kullaniciKimlik,
            sifreHash: await bcryptHash(sifre),
            accessToken,
            refreshToken
        }));
        aygitYonetici?.anaSifreKaydet(sifre);
        dispatch(sifreBelirle(sifre));
        dispatch(sifreGuncelDurumBelirle(false));

    };

    const urlDegistir = (yeniUrl: string) => {
        dispatch(urlBelirle(yeniUrl));
    }
      
    return (
        <div style={{paddingLeft: '5px', paddingRight: '5px'}}>
            <div className='flex justify-content-center'>
                <h1>{t('oturumAc.baslik')}</h1>
            </div>
            <form 
                className='mt-3'
                onSubmit={handleSubmit(oturumAc)}
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
                    <span className="p-float-label">
                        <InputText 
                            id="kullaniciAdi" 
                            value={kullaniciAdi} 
                            onChange={(e) => kullaniciAdiDegistir(e.target.value)} 
                            className={classNames('w-full', {'p-invalid': validator.messagesShown && !validator.fieldValid('kullaniciAdi')})} 
                            aria-describedby="kullaniciAdi-mesaj"
                        />
                        <label htmlFor="kullaniciAdi">{t('oturumAc.kullaniciAdi.label')}</label>
                    </span>
                    <small id="kullaniciAdi-mesaj" className='hata'>
                    {
                        validator.message('kullaniciAdi', kullaniciAdi, {
                            validate: (val: string) => !val ? t('oturumAc.kullaniciAdi.hata.gerekli') : ''
                        }) 
                    }
                    </small>
                </div>
                <div className="field h-4rem">
                    <div className='p-inputgroup'>
                        <span className="p-float-label">
                            <InputText 
                                id="sifre" 
                                type={sifreGoster ? 'text' : 'password'} 
                                value={sifre} 
                                onChange={(e) => sifreDegistir(e.target.value)} 
                                className={classNames('w-full', {'p-invalid': validator.messagesShown && !validator.fieldValid('sifre')})} 
                                aria-describedby="sifre-mesaj"
                            />
                            <label htmlFor="sifre">{t('oturumAc.sifre.label')}</label>
                        </span>
                        <Button type='button' icon={"pi " + (sifreGoster ? "pi-eye" : "pi-eye-slash")} className="p-button-success" onClick={() => sifreGosterDegistir(!sifreGoster)} />
                    </div>
                    <small id="sifre-mesaj" className='hata'>
                    {
                        validator.message('sifre', sifre, {
                            validate: (val: string) => !val ? t('oturumAc.sifre.hata.regex') : ''
                        }) 
                    }
                    </small>
                </div>
                <div className="field">
                    <Button 
                        type='button' 
                        label={t('oturumAc.oturumAc.label')}
                        className='w-full' 
                        onClick={oturumAc} 
                    />
                </div>
                <div className="field">
                    <Button 
                        type='button' 
                        label={t('oturumAc.kayitOl.label')}
                        className='w-full' 
                        onClick={kayitOl} 
                    />
                </div>
            </form>
        </div>
    );
}

export default OturumAc;
