import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import React, { useState } from 'react';

interface PasswordRequestProps {
    onSubmit: (password: string) => void; // Şifre gönderildiğinde çağrılacak fonksiyon
}

const PasswordRequest: React.FC<PasswordRequestProps> = ({ onSubmit }) => {
    const [inputPassword, setInputPassword] = useState('');

    const handlePasswordSubmit = () => {
        onSubmit(inputPassword); // Şifreyi gönder
    };

    return (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '30px', borderRadius: '8px', boxShadow: '0 0 10px rgba(255,0,0,1)', width: '300px' }}>
            <div className="field h-4rem">
                    <div className='p-inputgroup'>
                        <span className="p-float-label">
                            <InputText 
                                id="sifre"
                                type="password" 
                                value={inputPassword} 
                                onChange={(e) => setInputPassword(e.target.value)} 
                            />
                            <label htmlFor="sifre">Şifre</label>
                        </span>
                    </div>
                </div>
                <div className="field">
                    <Button 
                        onClick={handlePasswordSubmit}
                        label="Onayla"
                        className='w-full' 
                    />
                </div>
        </div>
    );
};

export default PasswordRequest;