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

interface HariciSifreDesifreTabloSatir extends HariciSifreDesifre {
    sifreGoster: boolean
}

const Kasa = () => {

    const hariciSifreDesifreListesi = useSelector((state: RootState) => state.codeyzerHafizaReducer.hariciSifreDesifreListesi);
    const aygitYonetici = AygitYoneticiKullan();
    const [hariciSifreDesifreTabloSatirListesi, hariciSifreDesifreTabloSatirListesiDegistir] = useState<HariciSifreDesifreTabloSatir[]>();
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

    return (
        <DataTable 
            value={hariciSifreDesifreTabloSatirListesi} 
            tableStyle={{ minWidth: '50rem' }}
            sortField="icerik.platform" 
            sortOrder={1} 
            removableSort
            stripedRows 
            rowHover
        >
            <Column 
                field='icerik.platform'
                header="Platform" 
                body={
                    (hsd: HariciSifreDesifreTabloSatir) => (
                        <InputText 
                            value={hsd.icerik.platform} 
                            className='w-full'
                        />
                )}
                className="p-inputtext-sm"
                sortable
            />
            <Column 
                field='icerik.androidPaket'
                header="Android" 
                body={
                    (hsd: HariciSifreDesifreTabloSatir) => (
                        <InputText 
                            value={hsd.icerik.androidPaket} 
                            className='w-full'
                        />
                )}
                className="p-inputtext-sm"
                sortable
            />
            <Column 
                field='icerik.kullaniciAdi'
                header="Kullanıcı adı" 
                body={
                    (hsd: HariciSifreDesifreTabloSatir) => (
                        <InputText 
                            value={hsd.icerik.kullaniciAdi} 
                            className='w-full'
                        />
                )}
                className="p-inputtext-sm"
                sortable
            />
            <Column 
                header="Şifre" 
                body={
                    (hsd: HariciSifreDesifreTabloSatir) => (
                        <InputText 
                            value={hsd.icerik.sifre} 
                            type={hsd.sifreGoster ? 'text' : 'password'}
                            className='w-full'
                        />
                )}
                className="p-inputtext-sm"
            />
            <Column 
                body={
                    (hsd: HariciSifreDesifreTabloSatir) => (
                        <div className='flex gap-2'>
                            <Button 
                                icon={"pi pi-clone"} 
                                className="p-button-success" 
                                onClick={() => kopyalaTiklandi(hsd)} 
                            />
                            <Button 
                                type='button' 
                                icon={"pi " + (hsd.sifreGoster ? "pi-eye" : "pi-eye-slash")} 
                                className="p-button-success" 
                                onClick={() => sifreGosterTiklandi(hsd)} 
                            />
                        </div>
                    )
                }
            />
        </DataTable>
    );
};

export default Kasa;