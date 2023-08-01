import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useSelector } from 'react-redux';
import { AygitYoneticiKullan, RootState, useAppDispatch } from '..';
import { HariciSifreDesifre } from '../ortak/HariciSifreDTO';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { mesajBelirle } from '../ortak/CodeyzerReducer';
import { MesajTipi } from '../ortak/BildirimMesaji';
import { FilterMatchMode } from 'primereact/api';
import KasaIskelet from './KasaIskelet';
import Yukleniyor from '../ortak/Yukleniyor';

interface HariciSifreDesifreTabloSatir extends HariciSifreDesifre {
    sifreGoster: boolean
}

const Kasa = () => {

    const hariciSifreDesifreListesi = useSelector((state: RootState) => state.codeyzerHafizaReducer.hariciSifreDesifreListesi);
    const aygitYonetici = AygitYoneticiKullan();
    const [hariciSifreDesifreTabloSatirListesi, hariciSifreDesifreTabloSatirListesiDegistir] = useState<HariciSifreDesifreTabloSatir[]>();
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const dispatch = useAppDispatch();

    useEffect(() => {
        hariciSifreDesifreTabloSatirListesiDegistir(
            hariciSifreDesifreListesi
            .map(hsd => ({
                ...hsd,
                sifreGoster: false
            }))
        );
    }, [hariciSifreDesifreListesi]);

    const kopyalaTiklandi = (hsd: HariciSifreDesifreTabloSatir) => {
        aygitYonetici?.panoyaKopyala(hsd.icerik.sifre);
        dispatch(mesajBelirle({
            tip: MesajTipi.BILGI,
            icerik: 'Kopyalandı'
        }));
    };

    const sifreGosterTiklandi = (hsd: HariciSifreDesifreTabloSatir) => {
        hsd.sifreGoster = !hsd.sifreGoster;
        hariciSifreDesifreTabloSatirListesiDegistir([...hariciSifreDesifreTabloSatirListesi!]);
    };

    const onGlobalFilterChange = (e: any) => {
        const value = e.target.value;
        setGlobalFilterValue(value);
    };

    const icerik = (
        <DataTable 
            value={hariciSifreDesifreTabloSatirListesi} 
            sortField="icerik.platform" 
            sortOrder={1} 
            removableSort
            stripedRows 
            rowHover
            header={
                <div className="flex justify-content-end">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText 
                            value={globalFilterValue} 
                            onChange={onGlobalFilterChange} 
                            placeholder="Ara" 
                            className="p-inputtext-sm"
                        />
                    </span>
                </div>
            }
            filters={
                {
                    global: { value: globalFilterValue, matchMode: FilterMatchMode.CONTAINS }
                }
            }
        >
            <Column 
                field='icerik.platform'
                header="Platform" 
                body={
                    (hsd: HariciSifreDesifreTabloSatir) => (
                        <Yukleniyor tip='iskelet' height='3rem'>
                            <InputText 
                                value={hsd.icerik.platform} 
                                className='w-full h-full'
                            />
                        </Yukleniyor>
                )}
                className="p-inputtext-sm"
                sortable
                style={{ width: '23%' }}
            />
            <Column 
                field='icerik.androidPaket'
                header="Android" 
                body={
                    (hsd: HariciSifreDesifreTabloSatir) => (
                        <Yukleniyor tip='iskelet' height='3rem'>
                            <InputText 
                                value={hsd.icerik.androidPaket} 
                                className='w-full h-full'
                            />
                        </Yukleniyor>
                )}
                className="p-inputtext-sm"
                sortable
                style={{ width: '23%' }}
            />
            <Column 
                field='icerik.kullaniciAdi'
                header="Kullanıcı adı" 
                body={
                    (hsd: HariciSifreDesifreTabloSatir) => (
                        <Yukleniyor tip='iskelet' height='3rem'>
                            <InputText 
                                value={hsd.icerik.kullaniciAdi} 
                                className='w-full h-full'
                            />
                        </Yukleniyor>
                )}
                className="p-inputtext-sm"
                sortable
                style={{ width: '23%' }}
            />
            <Column 
                header="Şifre" 
                body={
                    (hsd: HariciSifreDesifreTabloSatir) => (
                        <Yukleniyor tip='iskelet' height='3rem'>
                            <InputText 
                                value={hsd.icerik.sifre} 
                                type={hsd.sifreGoster ? 'text' : 'password'}
                                className='w-full h-full'
                            />
                        </Yukleniyor>
                )}
                className="p-inputtext-sm"
                style={{ width: '23%' }}
            />
            <Column 
                body={
                    (hsd: HariciSifreDesifreTabloSatir) => (
                        <div className='flex gap-2'>
                            <Yukleniyor tip='engelle'>
                                <Button 
                                    type='button' 
                                    icon={"pi pi-clone"} 
                                    className="p-button-success" 
                                    onClick={() => kopyalaTiklandi(hsd)} 
                                />
                            </Yukleniyor>
                            <Yukleniyor tip='engelle'>
                                <Button 
                                    type='button' 
                                    icon={"pi " + (hsd.sifreGoster ? "pi-eye" : "pi-eye-slash")} 
                                    className="p-button-success" 
                                    onClick={() => sifreGosterTiklandi(hsd)} 
                                />
                            </Yukleniyor>
                        </div>
                    )
                }
            />
        </DataTable>
    );

    return (
        icerik
    );
};

export default Kasa;