import React, { useState } from 'react';
import Kasa from './Kasa';
import Aktar from './Aktar';
import { TabMenu } from 'primereact/tabmenu';
import { MenuItem } from 'primereact/menuitem';
import HesapPaneli from './HesapPaneli';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';

enum GelismisAyarlarPanelEnum {
    KASA,
    AKTAR,
    HESAP
}

const panelToIndex = (panel: GelismisAyarlarPanelEnum): number => {
    switch (panel) {
        case GelismisAyarlarPanelEnum.KASA:
            return 0;
        case GelismisAyarlarPanelEnum.AKTAR:
            return 1;
        case GelismisAyarlarPanelEnum.HESAP:
            return 2;
        default:
            return 0;
    }
};

const indexToPanel = (index: number): GelismisAyarlarPanelEnum => {
    switch (index) {
        case 0:
            return GelismisAyarlarPanelEnum.KASA;
        case 1:
            return GelismisAyarlarPanelEnum.AKTAR;
        case 2:
            return GelismisAyarlarPanelEnum.HESAP;
        default:
            return GelismisAyarlarPanelEnum.KASA;
    }
};

const GelismisAyarlar = () => {

    const [seciliPanel, seciliPanelDegistir] = useState<GelismisAyarlarPanelEnum>(GelismisAyarlarPanelEnum.KASA);
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const handlePanelChange = (panel: GelismisAyarlarPanelEnum) => {
        seciliPanelDegistir(panel);
        setSidebarVisible(false);
    };

    const items: MenuItem[] = [
        {
            label: 'Kasa',
            icon: 'pi pi-fw pi-database',
            command: () => handlePanelChange(GelismisAyarlarPanelEnum.KASA)
        },
        {
            label: 'Aktar',
            icon: 'pi pi-fw pi-upload',
            command: () => handlePanelChange(GelismisAyarlarPanelEnum.AKTAR)
        },
        {
            label: 'Hesap',
            icon: 'pi pi-fw pi-user',
            command: () => handlePanelChange(GelismisAyarlarPanelEnum.HESAP)
        }
    ];

    const menuContent = (
        <TabMenu 
            model={items} 
            activeIndex={panelToIndex(seciliPanel)} 
            pt={{ 
                menu: { className: 'flex-column w-full border-none' },
            }}
        />
    );

    return (
        <div className='flex flex-column' style={{height: '98vh'}}>
            <div className="md:hidden p-3 flex justify-content-between align-items-center border-bottom-1 surface-border">
                <span className="font-bold">Gelişmiş Ayarlar</span> 
                <Button 
                    icon="pi pi-bars" 
                    onClick={() => setSidebarVisible(true)} 
                    className="p-button-text" 
                />
            </div>

            <Sidebar visible={sidebarVisible} onHide={() => setSidebarVisible(false)} className="w-15rem">
                <h3 className='ml-3 mt-0 mb-3'>Menü</h3>
                {menuContent}
            </Sidebar>

            <div className='flex-grow-1 flex overflow-hidden'>
                <div className='hidden md:block flex-none w-2 border-right-1 surface-border p-3 sticky top-0'>
                    {menuContent}
                </div>
                <div className='flex-grow-1'>
                    <div className='p-3'>
                        { seciliPanel === GelismisAyarlarPanelEnum.KASA && <Kasa/> }
                        { seciliPanel === GelismisAyarlarPanelEnum.AKTAR && <Aktar/> }
                        { seciliPanel === GelismisAyarlarPanelEnum.HESAP && <HesapPaneli/> }
                    </div>
                </div>
            </div>
            <div className="mt-auto pt-2 pb-2 pl-3 text-xs border-top-1 border-surface-200 flex align-items-center">
                <img src="/images/icon_48.png" alt="CodeyzerPass Logo" style={{ height: '18px', verticalAlign: 'middle', marginRight: '5px' }} />
                <span className="text-gray-500">CodeyzerPass</span>
            </div>
        </div>
    );
};

export default GelismisAyarlar;