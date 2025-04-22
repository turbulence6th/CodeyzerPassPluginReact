import { useValidator } from '@validator.tool/hook';
import { useState } from 'react';

interface UsePasswordValidationProps {
    validateConfirmation?: boolean; // Flag to enable/disable confirmation validation
    initialPassword?: string;
    initialPasswordConfirmation?: string;
}

/**
 * Şifre ve isteğe bağlı olarak şifre tekrarı alanları için validasyon sağlayan hook.
 * @param {UsePasswordValidationProps} props - Hook konfigürasyonu.
 * @returns Validasyon durumu ve yardımcı fonksiyonlar.
 */
export const usePasswordValidation = ({ 
    validateConfirmation = false, 
    initialPassword = '', 
    initialPasswordConfirmation = '' 
}: UsePasswordValidationProps = {}) => {

    const [password, setPassword] = useState<string>(initialPassword);
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>(initialPasswordConfirmation);

    const { validator, handleSubmit, forceUpdate } = useValidator({
        messagesShown: false,
        rules: {
            // Şifre kuralı: Her zaman gerekli
            password: {
                validate: (val: string) => !val ? 'Şifre gerekli' : '',
            },
            // Şifre Tekrarı kuralı: Sadece validateConfirmation true ise aktif
            ...(validateConfirmation && {
                passwordConfirmation: {
                    // Assume validate receives all field values as the second argument
                    validate: (val: string, allValues: Record<string, any>) => { 
                        // console.log(`Validating confirmation: val='${val}', password from state='${password}', password from allValues='${allValues?.password}'`); // Keep for one more test if needed
                        if (!val) return 'Şifre tekrarı gerekli';
                        // Compare with the current value from the validator context
                        if (val !== allValues?.password) { 
                            // console.log('Passwords do not match! (Comparing with allValues)');
                            return 'Şifreler eşleşmiyor';
                        }
                        // console.log('Passwords match! (Comparing with allValues)');
                        return '';
                    },
                },
            }),
        },
    });

    // Şifre değiştiğinde, tekrar alanının validasyonunu tetikle
    const handlePasswordChange = (value: string) => {
        // console.log(`handlePasswordChange: new value='${value}'`);
        setPassword(value);
        if (validateConfirmation) {
            // console.log(`handlePasswordChange: triggering validation for passwordConfirmation`);
            // Tetikleme hala gerekli olabilir, çünkü kural artık allValues'a bakıyor
            validator.fieldValid('passwordConfirmation'); 
        }
    };

    // Şifre tekrarı değiştiğinde sadece state'i güncelle
    const handlePasswordConfirmationChange = (value: string) => {
        // console.log(`handlePasswordConfirmationChange: new value='${value}'`);
        setPasswordConfirmation(value);
        // No need to manually trigger password validation here
    };
    
    // Form gönderildiğinde tüm alanları doğrula
    const validateAll = () => {
        const isValid = validator.allValid();
        if (!isValid) {
            validator.showMessages();
            forceUpdate();
        }
        return isValid;
    };

    return {
        password,
        passwordConfirmation,
        setPassword, // Directly setting might be needed sometimes
        setPasswordConfirmation,
        handlePasswordChange,
        handlePasswordConfirmationChange,
        validator, // Expose validator for message display etc.
        handleSubmit, // Expose handleSubmit if needed for form onSubmit
        forceUpdate, // Expose forceUpdate if needed
        validateAll, // Helper to validate all fields manually
    };
}; 