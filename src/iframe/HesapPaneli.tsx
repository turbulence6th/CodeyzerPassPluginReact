import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useSelector } from 'react-redux';
import { RootState } from '..'; // Assuming RootState is exported from index
import { usePasswordValidation } from '../hooks/usePasswordValidation'; // Import the hook
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'; // Import the meter
import { classNames } from 'primereact/utils'; // Import classNames
import { useValidator } from '@validator.tool/hook'; // Import useValidator for username

const HesapPaneli = () => {
    // Removed kullanici state fetch as it's not used for the editable username
    const [hesapKullaniciAdi, hesapKullaniciAdiDegistir] = useState(''); // State for editable username
    const [sifreGoster, sifreGosterDegistir] = useState(false);
    const [sifreTekrarGoster, sifreTekrarGosterDegistir] = useState(false);

    // Validator hook for password fields
    const { 
        password, 
        passwordConfirmation, 
        handlePasswordChange, 
        handlePasswordConfirmationChange, 
        validator: passwordValidator, // Rename to avoid conflict
        validateAll: validatePasswords, 
        forceUpdate: forcePasswordUpdate 
    } = usePasswordValidation({ validateConfirmation: true });

    // Separate validator hook for username field
    const { 
        validator: usernameValidator, 
        forceUpdate: forceUsernameUpdate, 
        // message, fieldValid, allValid are accessed via usernameValidator object
    } = useValidator({
        messagesShown: false,
        rules: {
            hesapKullaniciAdi: {
                 validate: (val: string) => !val ? 'Kullanıcı adı gerekli' : '',
            }
        }
    });

    const sifreDegistirTiklandi = () => {
        // Validate both sets of fields
        const passwordsAreValid = validatePasswords();
        const usernameIsValid = usernameValidator.allValid(); // Use the validator object directly

        if (!passwordsAreValid || !usernameIsValid) {
            // Show messages for invalid fields
            if (!passwordsAreValid) {
                passwordValidator.showMessages(); // Use specific validator
                forcePasswordUpdate();
            }
            if (!usernameIsValid) {
                usernameValidator.showMessages(); // Use specific validator
                forceUsernameUpdate(); 
            }
            return; // Stop if any validation fails
        }
        
        console.log("Şifre değiştirme işlemi tetiklendi (validasyon başarılı, API call yapılacak)");
        console.log("Kullanıcı Adı:", hesapKullaniciAdi); // Log the entered username
        // TODO: Şifre değiştirme mantığını buraya ekle
        // 3. API'yi çağırarak şifreyi değiştir (pass hesapKullaniciAdi)
        // 4. Başarı/hata mesajı göster.
    };

    return (
        <Card title="Hesap Ayarları">
            <div className="p-fluid flex flex-column gap-3" style={{ maxWidth: '400px' }}>
                {/* Kullanıcı Adı (Editable) */}
                <div className="p-field">
                    <span className="p-float-label">
                        <InputText
                            id="hesapKullaniciAdi" // Changed id
                            value={hesapKullaniciAdi} // Use state value
                            onChange={(e) => hesapKullaniciAdiDegistir(e.target.value)} // Update state
                            // Use usernameValidator for className
                            // Access fieldValid via usernameValidator
                            className={classNames("w-full", { 'p-invalid': usernameValidator.messagesShown && !usernameValidator.fieldValid('hesapKullaniciAdi') })}
                            aria-describedby="hesapKullaniciAdi-mesaj"
                        />
                        <label htmlFor="hesapKullaniciAdi">Kullanıcı Adı</label>
                    </span>
                    {/* Validation message for username */}
                    <small id="hesapKullaniciAdi-mesaj" className='p-error' style={{ minHeight: '1.2em', display: 'block' }}>
                         {/* Access message via usernameValidator */}
                        {usernameValidator.message('hesapKullaniciAdi', hesapKullaniciAdi)}
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
                                    // Use passwordValidator for className
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
                        {/* Use passwordValidator */}
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
                                // Use passwordValidator for className
                                className={classNames('w-full', { 'p-invalid': passwordValidator.messagesShown && !passwordValidator.fieldValid('passwordConfirmation') })}
                                placeholder="Yeni Şifre Tekrar"
                                aria-describedby="yeniSifreTekrar-mesaj"
                            />
                             <label htmlFor="yeniSifreTekrar">Yeni Şifre Tekrar</label>
                        </span>
                         <Button type="button" icon={"pi " + (sifreTekrarGoster ? "pi-eye" : "pi-eye-slash")} className="p-button-secondary p-button-outlined" onClick={() => sifreTekrarGosterDegistir(!sifreTekrarGoster)} />
                    </div>
                     <small id="yeniSifreTekrar-mesaj" className='p-error' style={{ minHeight: '1.2em', display: 'block' }}>
                         {/* Use passwordValidator */}
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