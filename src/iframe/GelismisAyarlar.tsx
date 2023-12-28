import React, { useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import Kasa from './Kasa';
import { Button } from 'primereact/button';
import Aktar from './Aktar';

enum GelismisAyarlarPanelEnum {
    KASA,
    AKTAR
}

const GelismisAyarlar = () => {

    const [seciliPanel, seciliPanelDegistir] = useState<GelismisAyarlarPanelEnum>(GelismisAyarlarPanelEnum.KASA);

    return (
        <div className='flex gap-3' style={{height: '98vh'}}>
            <div className='flex flex-column gap-3 flex-none w-2 border-right-1 p-3 border-blue-50 sticky top-0'>
                <Button 
                    label='Kasa' 
                    className='w-full' 
                    onClick={() => seciliPanelDegistir(GelismisAyarlarPanelEnum.KASA)} 
                    size='large' 
                    outlined={seciliPanel === GelismisAyarlarPanelEnum.KASA}
                />
                <Button 
                    label='Aktar' 
                    className='w-full' 
                    onClick={() => seciliPanelDegistir(GelismisAyarlarPanelEnum.AKTAR)} 
                    size='large' 
                    outlined={seciliPanel === GelismisAyarlarPanelEnum.AKTAR}
                />
            </div>
            <div className='flex-grow-1 overflow-y-auto'>
                { seciliPanel === GelismisAyarlarPanelEnum.KASA && <Kasa/> }
                { seciliPanel === GelismisAyarlarPanelEnum.AKTAR && <Aktar/> }
            </div>
        </div>
    );
};

export default GelismisAyarlar;