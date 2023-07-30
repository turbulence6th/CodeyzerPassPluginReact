import React, { useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import Kasa from './Kasa';
import { Button } from 'primereact/button';

const GelismisAyarlar = () => {

    const [seciliPanel, seciliPanelDegistir] = useState<string>();

    return (
        <div className='flex gap-3 min-h-screen'>
            <div className='flex flex-column gap-3 flex-none w-2 border-right-1 p-3 border-blue-50 sticky top-0'>
                <Button 
                    label='Kasa' 
                    className='w-full' 
                    onClick={() => seciliPanelDegistir('Kasa')} 
                    size='large' 
                    outlined={seciliPanel === 'Kasa'}
                />
                <Button 
                    label='Deneme' 
                    className='w-full' 
                    onClick={() => seciliPanelDegistir('Deneme')} 
                    size='large' 
                    outlined={seciliPanel === 'Deneme'}
                />
                <Button 
                    label='Deneme2' 
                    className='w-full' 
                    onClick={() => seciliPanelDegistir('Deneme2')} 
                    size='large' 
                    outlined={seciliPanel === 'Deneme2'}
                />
            </div>
            <div className='flex-grow-1'>
                { seciliPanel === 'Kasa' && <Kasa/> }
            </div>
        </div>
    );
};

export default GelismisAyarlar;