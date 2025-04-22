// Kayıt Olma Formu Bileşeni
import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { usePasswordValidation } from '../hooks/usePasswordValidation'; // Import the new hook
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'; // Import the new component
import { useValidator } from '@validator.tool/hook';

interface KayitOlFormuProps {
    onSubmit: (kullaniciAdi: string, sifre: string) => Promise<void>;
}

const KayitOlFormu: React.FC<KayitOlFormuProps> = ({ onSubmit }) => {
    const [kullaniciAdi, kullaniciAdiDegistir] = useState<string>('');
    const [sifreGoster, sifreGosterDegistir] = useState<boolean>(false);
    const [sifreTekrarGoster, sifreTekrarGosterDegistir] = useState<boolean>(false);

    // Use the custom hook for password validation
    const { 
        password, 
        passwordConfirmation, 
        handlePasswordChange, 
        handlePasswordConfirmationChange, 
        validator, 
        handleSubmit, 
        forceUpdate, 
        validateAll 
    } = usePasswordValidation({ validateConfirmation: true });

    // Use a separate validator for username (or integrate into the hook if desired later)
    const { validator: usernameValidator, forceUpdate: usernameForceUpdate } = useValidator({ messagesShown: false });

    const handleLocalSubmit = () => {
        const isPasswordValid = validateAll(); // Validate password fields using the hook
        const isUsernameValid = usernameValidator.allValid(); // Validate username separately
        
        if (!isPasswordValid || !isUsernameValid) {
            // Show messages for both validators
            if (!isPasswordValid) {
                validator.showMessages();
                forceUpdate(); 
            }
            if (!isUsernameValid) {
                usernameValidator.showMessages();
                usernameForceUpdate();
            }
            return;
        }
        onSubmit(kullaniciAdi, password); // Use password from the hook
    };

    return (
        <form onSubmit={handleSubmit(handleLocalSubmit)} className='mt-3'>
            <div className="p-field mb-3">
                <span className="p-float-label">
                    <InputText 
                        id="registerKullaniciAdi"
                        value={kullaniciAdi} 
                        onChange={(e) => kullaniciAdiDegistir(e.target.value)} 
                        // Use usernameValidator here
                        className={classNames('w-full', {'p-invalid': usernameValidator.messagesShown && !usernameValidator.fieldValid('kullaniciAdi')})} 
                        aria-describedby="registerKullaniciAdi-mesaj"
                    />
                    <label htmlFor="registerKullaniciAdi">Kullanıcı Adı</label>
                </span>
                <small id="registerKullaniciAdi-mesaj" className='p-error' style={{ minHeight: '1.2em', display: 'block' }}>
                {/* Use usernameValidator here */}
                {usernameValidator.message('kullaniciAdi', kullaniciAdi, {
                    validate: (val: string) => !val ? 'Kullanıcı adı gerekli' : ''
                })}
                </small>
            </div>
            <div className="p-field mb-3">
                <div className="p-inputgroup">
                     {/* Use a wrapper div for relative positioning of the strength meter */}
                    <div style={{ position: 'relative', width: '100%' }}> 
                        <span className="p-float-label">
                            <InputText 
                                id="registerSifre" 
                                type={sifreGoster ? 'text' : 'password'} 
                                // Use value and onChange from the hook
                                value={password}
                                onChange={(e) => handlePasswordChange(e.target.value)} 
                                // Use validator from the hook
                                className={classNames('w-full', { 'p-invalid': validator.messagesShown && !validator.fieldValid('password') })} 
                                aria-describedby="registerSifre-mesaj"
                            />
                            <label htmlFor="registerSifre">Şifre</label>
                        </span>
                         {/* Use the PasswordStrengthMeter component */}
                        <PasswordStrengthMeter password={password} />
                    </div>
                    <Button 
                        type='button' 
                        icon={"pi " + (sifreGoster ? "pi-eye" : "pi-eye-slash")} 
                        className="p-button-secondary p-button-outlined"
                        onClick={() => sifreGosterDegistir(!sifreGoster)} 
                    />
                </div>
                <small id="registerSifre-mesaj" className='p-error' style={{ minHeight: '1.2em', display: 'block' }}>
                {/* Use validator from the hook, rule is defined in the hook */}
                {validator.message('password', password)}
                </small>
            </div>
            <div className="p-field mb-3">
                <div className="p-inputgroup">
                    <span className="p-float-label">
                        <InputText 
                            id="registerSifreTekrar" 
                            type={sifreTekrarGoster ? 'text' : 'password'} 
                             // Use value and onChange from the hook
                            value={passwordConfirmation}
                            onChange={(e) => handlePasswordConfirmationChange(e.target.value)} 
                            // Use validator from the hook
                            className={classNames('w-full', { 'p-invalid': validator.messagesShown && !validator.fieldValid('passwordConfirmation') })} 
                            aria-describedby="registerSifreTekrar-mesaj"
                        />
                        <label htmlFor="registerSifreTekrar">Şifre Tekrar</label>
                    </span>
                    <Button 
                        type='button' 
                        icon={"pi " + (sifreTekrarGoster ? "pi-eye" : "pi-eye-slash")} 
                        className="p-button-secondary p-button-outlined"
                        onClick={() => sifreTekrarGosterDegistir(!sifreTekrarGoster)} 
                    />
                </div>
                <small id="registerSifreTekrar-mesaj" className='p-error' style={{ minHeight: '1.2em', display: 'block' }}>
                 {/* Use validator from the hook, rule is defined in the hook */}
                {validator.message('passwordConfirmation', passwordConfirmation)}
                </small>
            </div>
            <div className="p-field">
                <Button 
                    type='submit' 
                    label='Kayıt Ol'
                    className='w-full' 
                    // Optional: Disable button if form is not valid
                    // disabled={!usernameValidator.allValid(false) || !validator.allValid(false)} 
                />
            </div>
        </form>
    );
};

export default KayitOlFormu; 