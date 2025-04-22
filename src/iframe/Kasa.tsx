import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useSelector } from 'react-redux';
import { AygitYoneticiKullan, RootState, useAppDispatch } from '..';
import { HariciSifreDesifre } from '../types/HariciSifreDTO';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { mesajBelirle, sifreGuncelDurumBelirle } from '../store/CodeyzerReducer';
import { MesajTipi } from '../types/BildirimMesaji';
import { FilterMatchMode } from 'primereact/api';
import Yukleniyor from '../components/Yukleniyor';
import { Card } from "primereact/card";
import SifreGuncelleModal from './components/SifreGuncelleModal';
import { dialogGoster } from '../utils/DialogUtil';
import { HariciSifreApi } from '../services/HariciSifreApi';

interface HariciSifreDesifreTabloSatir extends HariciSifreDesifre {
    sifreGoster: boolean
}

const Kasa = () => {

    const hariciSifreDesifreListesi = useSelector((state: RootState) => state.codeyzerHafizaReducer.hariciSifreDesifreListesi);
    const aygitYonetici = AygitYoneticiKullan();
    const [hariciSifreDesifreTabloSatirListesi, hariciSifreDesifreTabloSatirListesiDegistir] = useState<HariciSifreDesifreTabloSatir[]>();
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const dispatch = useAppDispatch();

    const [modalGoster, modalGosterDegistir] = useState(false);
    const [seciliSifre, seciliSifreDegistir] = useState<HariciSifreDesifreTabloSatir | null>(null);

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
        aygitYonetici?.panoyaKopyala(hsd.data.sifre);
        dispatch(mesajBelirle({
            tip: MesajTipi.BILGI,
            icerik: 'Kopyalandı'
        }));
    };

    const sifreGosterTiklandi = (hsd: HariciSifreDesifreTabloSatir) => {
        hsd.sifreGoster = !hsd.sifreGoster;
        hariciSifreDesifreTabloSatirListesiDegistir([...hariciSifreDesifreTabloSatirListesi!]);
    };

    const guncelleTiklandi = (hsd: HariciSifreDesifreTabloSatir) => {
        seciliSifreDegistir(hsd);
        modalGosterDegistir(true);
    };

    const modalKapat = () => {
        modalGosterDegistir(false);
        seciliSifreDegistir(null);
    };

    const silTiklandi = (hsd: HariciSifreDesifreTabloSatir) => {
        dialogGoster(
            'Onay',
            `'${hsd.metadata.url || hsd.metadata.android || hsd.data.kullaniciAdi}' kaydını silmek istediğinizden emin misiniz?`,
            async () => {
                try {
                    await HariciSifreApi.delete(hsd.id);
                    dispatch(sifreGuncelDurumBelirle(false));
                    dispatch(mesajBelirle({ tip: MesajTipi.BILGI, icerik: 'Şifre başarıyla silindi.'}));
                } catch (error) {
                    console.error("Şifre silinirken hata:", error);
                    dispatch(mesajBelirle({ tip: MesajTipi.HATA, icerik: 'Şifre silinirken bir hata oluştu.'}));
                }
            }
        );
    };

    const onGlobalFilterChange = (e: any) => {
        const value = e.target.value;
        setGlobalFilterValue(value);
    };

    const icerik = (
        <Card title="Kayıtlı Şifreler" className="mt-3">
        <DataTable 
            value={hariciSifreDesifreTabloSatirListesi} 
            sortField="icerik.platform" 
            sortOrder={1} 
            removableSort
            stripedRows 
            rowHover
            rowClassName={() => 'kasa-data-row'}
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
                    field='metadata.url'
                header="Platform" 
                body={
                        (hsd: HariciSifreDesifreTabloSatir) => {
                            const content = hsd.metadata.url || '';
                            return (
                                <span 
                                    title={content} 
                                    className="stacked-text-right" 
                                    style={{ 
                                        display: 'inline-block', 
                                        width: '100%', 
                                        whiteSpace: 'nowrap', 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis' 
                                    }}>
                                        {content}
                                    </span>
                            );
                        }
                    }
                sortable
                    
                    bodyStyle={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '0.5rem' }}
            />
            <Column 
                    field='metadata.android'
                header="Android" 
                body={
                        (hsd: HariciSifreDesifreTabloSatir) => {
                            const content = hsd.metadata.android || '';
                            return (
                                <span 
                                    title={content} 
                                    className="stacked-text-right" 
                                    style={{ 
                                        display: 'inline-block', 
                                        width: '100%', 
                                        whiteSpace: 'nowrap', 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis' 
                                    }}>
                                        {content}
                                    </span>
                            );
                        }
                    }
                sortable
                    
                    bodyStyle={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '0.5rem' }}
            />
            <Column 
                    field='data.kullaniciAdi'
                header="Kullanıcı adı" 
                body={
                        (hsd: HariciSifreDesifreTabloSatir) => {
                            const content = hsd.data.kullaniciAdi || '';
                            return (
                                <span 
                                    title={content} 
                                    className="stacked-text-right" 
                                    style={{ 
                                        display: 'inline-block', 
                                        width: '100%', 
                                        whiteSpace: 'nowrap', 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis' 
                                    }}>
                                        {content}
                                    </span>
                            );
                        }
                    }
                sortable
                    
                    bodyStyle={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '0.5rem' }}
                    headerClassName="no-wrap-header"
            />
            <Column 
                    field='data.sifre'
                header="Şifre" 
                body={
                        (hsd: HariciSifreDesifreTabloSatir) => {
                           const spanStyle: React.CSSProperties = {
                            display: 'inline-block', 
                            width: '100%', 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                           };
                           return (
                               <>
                                   <span style={{
                                       ...spanStyle,
                                       display: hsd.sifreGoster ? 'inline-block' : 'none'
                                   }}>
                                       {hsd.data.sifre}
                                   </span>
                                   <span style={{
                                       ...spanStyle,
                                       display: !hsd.sifreGoster ? 'inline-block' : 'none' 
                                   }}>
                                       {'••••••••'}
                                   </span>
                               </>
                           );
                        }
                    }
                    
                    bodyStyle={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '0.5rem' }}
            />
            <Column 
                    header="Eylemler" 
                body={
                    (hsd: HariciSifreDesifreTabloSatir) => (
                            <div className='flex gap-2'>
                                <Yukleniyor tip='engelle'>
                                    <Button 
                                        type='button' 
                                        icon={"pi pi-pencil"} 
                                        className="p-button-info p-button-outlined" 
                                        onClick={() => guncelleTiklandi(hsd)} 
                                        rounded
                                        size='small'
                                        title="Güncelle"
                                    />
                                </Yukleniyor>
                            <Yukleniyor tip='engelle'>
                                <Button 
                                    type='button' 
                                    icon={"pi pi-clone"} 
                                    className="p-button-secondary p-button-outlined" 
                                    onClick={() => kopyalaTiklandi(hsd)} 
                                    rounded
                                    size='small'
                                    title="Kopyala"
                                />
                            </Yukleniyor>
                            <Yukleniyor tip='engelle'>
                                <Button 
                                    type='button' 
                                    icon={hsd.sifreGoster ? "pi pi-eye-slash" : "pi pi-eye"} 
                                    className="p-button-help p-button-outlined" 
                                    onClick={() => sifreGosterTiklandi(hsd)} 
                                    rounded
                                    size='small'
                                    title={hsd.sifreGoster ? "Gizle" : "Göster"}
                                />
                            </Yukleniyor>
                            <Yukleniyor tip='engelle'>
                                <Button 
                                    type='button' 
                                    icon={"pi pi-trash"} 
                                    className="p-button-danger p-button-outlined" 
                                    onClick={() => silTiklandi(hsd)} 
                                    rounded
                                    size='small'
                                    title="Sil"
                                />
                            </Yukleniyor>
                        </div>
                    )
                }
                    
                    bodyStyle={{ textAlign: 'center', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
            />
        </DataTable>
        </Card>
    );

    return (
        <>
            {icerik}

            <SifreGuncelleModal
                visible={modalGoster}
                onHide={modalKapat}
                sifreToUpdate={seciliSifre}
            />
        </>
    );
};

export default Kasa;