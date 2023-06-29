import React, { useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import Kasa from './Kasa';
import { Button } from 'primereact/button';

const GelismisAyarlar = () => {

    const [yanPanelGoster, yanPanelGosterDegistir] = useState<boolean>(false);

    return (
        <>
            <Sidebar visible={yanPanelGoster} onHide={() => yanPanelGosterDegistir(false)} showCloseIcon={false}>
                <div className='flex flex-column gap-3'>
                    <Button label='Kasa' className='w-full' onClick={() => yanPanelGosterDegistir(false)} outlined size='large' />
                </div>
            </Sidebar>
            <Button icon="pi pi-arrow-right" onClick={() => yanPanelGosterDegistir(true)} />
            <Kasa/>
        </>
    );
};

export default GelismisAyarlar;