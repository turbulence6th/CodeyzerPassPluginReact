import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '..';
import { hariciSifreListesiBelirle, kullaniciBelirle, sifreBelirle, sifreGuncelDurumBelirle } from '../store/CodeyzerReducer';
import { usePasswordValidation } from '../hooks/usePasswordValidation';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { classNames } from 'primereact/utils';
import { useValidator } from '@validator.tool/hook';
import {
    generateIV,
    uint8ArrayToBase64,
} from '../utils/CryptoUtil';
import { HariciSifreDesifre, SifreGuncelleHariciSifreDTO } from '../types/HariciSifreDTO';
import { KullaniciApi } from '../services/KullaniciApi';
import {
    SifreGuncelleRequestDTO,
    JwtResponseDTO
} from '../types/KullaniciDTO';
import { AuthService } from '../services/AuthService';

const HesapPaneli = () => {
    // Redux state
    const kullanici = useSelector((state: RootState) => state.codeyzerDepoReducer.kullanici);
    const reduxSifre = useSelector((state: RootState) => state.codeyzerHafizaReducer.sifre);
    const hariciSifreDesifreListesi = useSelector((state: RootState) => state.codeyzerHafizaReducer.hariciSifreDesifreListesi);
    const dispatch = useAppDispatch();

    const [hesapKullaniciAdi, hesapKullaniciAdiDegistir] = useState('');
    const [sifreGoster, sifreGosterDegistir] = useState(false);
    const [sifreTekrarGoster, sifreTekrarGosterDegistir] = useState(false);
    const [kimlikEslesmeHatasi, kimlikEslesmeHatasiBelirle] = useState<string | null>(null);

    const {
        password,
        passwordConfirmation,
        handlePasswordChange,
        handlePasswordConfirmationChange,
        validator: passwordValidator,
        validateAll: validatePasswords,
        forceUpdate: forcePasswordUpdate
    } = usePasswordValidation({ validateConfirmation: true });

    const {
        validator: fieldValidator,
        forceUpdate: forceFieldUpdate,
    } = useValidator({
        messagesShown: false,
        rules: {
            hesapKullaniciAdi: {
                // Kural güncellendi: Önce kimlik hatasını kontrol et
                validate: (val: string) => (!val ? 'Kullanıcı adı gerekli' : ''),
            },
        }
    });

    const sifreDegistirTiklandi = async () => {
        kimlikEslesmeHatasiBelirle(null);
        fieldValidator.hideMessages();

        const passwordsAreValid = validatePasswords();
        const fieldsAreValid = fieldValidator.allValid();

        if (!passwordsAreValid || !fieldsAreValid) {
            if (!passwordsAreValid) {
                passwordValidator.showMessages();
                forcePasswordUpdate();
            }
            if (!fieldsAreValid) {
                fieldValidator.showMessages();
                forceFieldUpdate();
            }
            return;
        }

        if (!kullanici?.kullaniciKimlik || !reduxSifre) {
            console.error("Kullanıcı veya şifre bilgisi Redux'ta bulunamadı.");
            kimlikEslesmeHatasiBelirle("Kritik veri eksik, işlem yapılamıyor.");
            fieldValidator.showMessages();
            forceFieldUpdate();
            return;
        }

        try {
            const eskiAuthService = await AuthService.createByKullaniciKimlik(kullanici.kullaniciKimlik, reduxSifre);

            if (!(await eskiAuthService.kullaniciAdiDogrula(hesapKullaniciAdi))) {
                kimlikEslesmeHatasiBelirle("Girilen kullanıcı adı mevcut kimlikle eşleşmiyor.");
                fieldValidator.showMessages();
                forceFieldUpdate();
                return;
            }

            const yeniAuthService = await AuthService.createByKullaniciAdi(hesapKullaniciAdi, password);

            const yeniSifrelenmisListeDto: SifreGuncelleHariciSifreDTO[] = await Promise.all(
                hariciSifreDesifreListesi.map(async (item: HariciSifreDesifre): Promise<SifreGuncelleHariciSifreDTO> => {
                    const hariciSifreDto = await yeniAuthService.sifrelenmisVeriOlustur(item);

                    return {
                        eskiId: item.id!,
                        id: crypto.randomUUID(),
                        encryptedData: hariciSifreDto.encryptedData,
                        encryptedMetadata: hariciSifreDto.encryptedMetadata,
                        aesIV: hariciSifreDto.aesIV
                    };
                })
            );

            const yeniKullaniciKimlik = yeniAuthService.kullaniciKimlikGetir();
            const requestDto: SifreGuncelleRequestDTO = {
                yeniKullaniciKimlik: yeniKullaniciKimlik,
                yeniSifreHash: await yeniAuthService.sifreSha512Olustur(),
                yeniHariciSifreList: yeniSifrelenmisListeDto
            };

            const response: JwtResponseDTO = await KullaniciApi.sifreGuncelle(requestDto);

            dispatch(kullaniciBelirle({
                ...kullanici,
                kullaniciKimlik: yeniKullaniciKimlik,
                sifreHash: await yeniAuthService.sifreBcryptHashOlustur(),
                accessToken: response.accessToken,
                refreshToken: response.refreshToken
            }));
            dispatch(sifreBelirle(password));
            dispatch(sifreGuncelDurumBelirle(false));

            console.log("Şifre başarıyla değiştirildi (API & Client).");
            handlePasswordChange('');
            handlePasswordConfirmationChange('');
            fieldValidator.hideMessages();
            passwordValidator.hideMessages();

        } catch (error: any) {
            console.error("Şifre değiştirme sırasında API veya istemci hatası:", error);
            const errorMessage = error?.response?.data?.message || "Şifre değiştirilirken bir hata oluştu.";
            kimlikEslesmeHatasiBelirle(errorMessage);
            fieldValidator.showMessages();
            forceFieldUpdate();
        }
    };

    return (
        <Card title="Hesap Ayarları">
            <div className="p-fluid flex flex-column gap-3" style={{ maxWidth: '400px' }}>
                {/* Kullanıcı Adı (Editable) */}
                <div className="p-field">
                    <span className="p-float-label">
                        <InputText
                            id="hesapKullaniciAdi"
                            value={hesapKullaniciAdi}
                            onChange={(e) => hesapKullaniciAdiDegistir(e.target.value)}
                            className={classNames("w-full", { 'p-invalid': fieldValidator.messagesShown && !fieldValidator.fieldValid('hesapKullaniciAdi') })}
                            aria-describedby="hesapKullaniciAdi-mesaj"
                        />
                        <label htmlFor="hesapKullaniciAdi">Kullanıcı Adı</label>
                    </span>
                    <small id="hesapKullaniciAdi-mesaj" className='p-error' style={{ minHeight: '1.2em', display: 'block' }}>
                        {fieldValidator.message('hesapKullaniciAdi', hesapKullaniciAdi) || kimlikEslesmeHatasi}
                    </small>
                </div>

                {/* Yeni Şifre (Uses passwordValidator) */}
                <div className="p-field">
                    <div className="p-inputgroup">
                        <div style={{ position: 'relative', width: '100%' }}>
                            <span className="p-float-label">
                                <InputText
                                    id="yeniSifre"
                                    type={sifreGoster ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    className={classNames('w-full', { 'p-invalid': passwordValidator.messagesShown && !passwordValidator.fieldValid('password') })}
                                    placeholder="Yeni Şifre"
                                    aria-describedby="yeniSifre-mesaj"
                                />
                                <label htmlFor="yeniSifre">Yeni Şifre</label>
                            </span>
                            <PasswordStrengthMeter password={password} />
                        </div>
                        <Button type="button" icon={"pi " + (sifreGoster ? "pi-eye" : "pi-eye-slash")} className="p-button-secondary p-button-outlined" onClick={() => sifreGosterDegistir(!sifreGoster)} />
                    </div>
                    <small id="yeniSifre-mesaj" className='p-error' style={{ minHeight: '1.2em', display: 'block' }}>
                        {passwordValidator.message('password', password)}
                    </small>
                </div>

                {/* Yeni Şifre Tekrar (Uses passwordValidator)*/}
                <div className="p-field">
                    <div className="p-inputgroup">
                        <span className="p-float-label">
                            <InputText
                                id="yeniSifreTekrar"
                                type={sifreTekrarGoster ? 'text' : 'password'}
                                value={passwordConfirmation}
                                onChange={(e) => handlePasswordConfirmationChange(e.target.value)}
                                className={classNames('w-full', { 'p-invalid': passwordValidator.messagesShown && !passwordValidator.fieldValid('passwordConfirmation') })}
                                placeholder="Yeni Şifre Tekrar"
                                aria-describedby="yeniSifreTekrar-mesaj"
                            />
                             <label htmlFor="yeniSifreTekrar">Yeni Şifre Tekrar</label>
                        </span>
                         <Button type="button" icon={"pi " + (sifreTekrarGoster ? "pi-eye" : "pi-eye-slash")} className="p-button-secondary p-button-outlined" onClick={() => sifreTekrarGosterDegistir(!sifreTekrarGoster)} />
                    </div>
                     <small id="yeniSifreTekrar-mesaj" className='p-error' style={{ minHeight: '1.2em', display: 'block' }}>
                        {passwordValidator.message('passwordConfirmation', passwordConfirmation)}
                     </small>
                </div>

                {/* Şifreyi Değiştir Butonu */}
                <div className="p-field mt-3">
                    <Button
                        label="Şifreyi Değiştir"
                        icon="pi pi-save"
                        onClick={sifreDegistirTiklandi}
                    />
                </div>
            </div>
        </Card>
    );
};

export default HesapPaneli; 