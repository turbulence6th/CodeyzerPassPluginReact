import { Button } from 'primereact/button';
import React from 'react';
import { useTranslation } from 'react-i18next';

const SifreBulundu = () => {

    const { t } = useTranslation();

    const kapatTiklandi = () => {
        let iframe = window.parent.document.getElementById('codeyzer-sifre-bulundu');
        iframe?.parentNode?.removeChild(iframe);

        // @ts-ignore
        chrome.storage.local.set({login: null}, function() {

        });
    };

    return (
        <div>
            <div className='flex w-full'>
                <div className='flex align-items-center gap-3'>
                    <img src='images/icon_48.png'/>
                    <p>
                        { t('contentScript.yeniSifreBulundu') }
                    </p>
                </div>

                <Button 
                    onClick={kapatTiklandi}
                    icon="pi pi-times" 
                    rounded 
                    text 
                    raised 
                    severity="danger"
                />
            </div>
            
        </div>
    );
}

export default SifreBulundu;
