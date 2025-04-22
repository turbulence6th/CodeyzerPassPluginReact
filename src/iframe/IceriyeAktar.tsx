import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { HariciSifreDTO, HariciSifreDesifre, HariciSifreHariciSifreData, HariciSifreMetadata } from '../types/HariciSifreDTO';
import { Dialog } from 'primereact/dialog';
import { useRef, useState } from 'react';
import { DataView } from 'primereact/dataview';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '..';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { sifreGuncelDurumBelirle } from '../store/CodeyzerReducer';
import IceriyeAktarAyrinti from './IceriyeAktarAyrinti';
import { classNames } from 'primereact/utils';
import { dialogGoster } from '../utils/DialogUtil';
import { InputText } from 'primereact/inputtext';
import { base64ToUint8Array, decryptWithAES, deriveAesKey, encryptWithAES, generateIV, uint8ArrayToBase64 } from '../utils/CryptoUtil';
import { HariciSifreApi } from '../services/HariciSifreApi';

export interface HariciSifreDesifreIceriyeAktar extends HariciSifreDesifre {
    durum: HariciSifreDesifreIceriyeAktarDurum
}

enum HariciSifreDesifreIceriyeAktarDurum {
    AKTIF = 3, EKLE = 0, GUNCELLE = 1, SIL = 2
}

const IceriyeAktar = () => {

    const kullanici = useSelector((state: RootState) => state.codeyzerDepoReducer.kullanici)!;
    const sifre = useSelector((state: RootState) => state.codeyzerHafizaReducer.sifre);
    const [diyalogGoster, diyalogGosterDegistir] = useState(false);
    const [dosyaHariciSifreDesifreList, dosyaHariciSifreDesifreListDegistir] = useState<HariciSifreDesifre[]>([]);
    const [farkliOlanlariGöster, farkliOlanlariGösterDegistir] = useState(false);
    const hariciSifreDesifreListesi = useSelector((state: RootState) => state.codeyzerHafizaReducer.hariciSifreDesifreListesi);
    const [seciliHariciSifreDesifreIceriAktarKimlik, seciliHariciSifreDesifreIceriAktarKimlikDegistir] = useState('');
    const dosyaSifreRef = useRef<HTMLInputElement>(null);
    const dispatch = useAppDispatch();

    const dosyaSecilmesiniEleAl = async (event: FileUploadHandlerEvent) => {
        
        const dosyaMetin = await dosyaOku(event.files[0]);
        const sifreler = JSON.parse(dosyaMetin) as any[];
        if (typeof(sifreler[0].icerik) === 'string') {
            try {
                await new Promise((resolve, error) => {
                    const body = (
                        <InputText ref={dosyaSifreRef} className="p-inputtext-sm" type='password'/>
                    );
                    dialogGoster('Dosya Şifresi', body, () => {
                        resolve(null);
                    }, () => {
                        error();
                    });
                });
            } catch(e) {
                return;
            }

            const dosyaDesifreler = await hariciSifreDesifreEt(sifreler);

            dosyaHariciSifreDesifreListDegistir(dosyaDesifreler);
        } else {
            dosyaHariciSifreDesifreListDegistir(sifreler as HariciSifreDesifre[]);
        }

        diyalogGosterDegistir(true);
        event.options.clear();
       
    };

    const hariciSifreDesifreEt = async (hariciSifreListesi: HariciSifreDTO[]) => {
        const aesKey = await deriveAesKey(sifre, kullanici.kullaniciKimlik);
        const hariciSifreDesifreListesi: HariciSifreDesifre[] = await Promise.all(hariciSifreListesi.map(async hariciSifreDTO => {
        const iv = base64ToUint8Array(hariciSifreDTO.aesIV);
        return {
            id: hariciSifreDTO.id,
            data: JSON.parse(await decryptWithAES(aesKey, hariciSifreDTO.encryptedData, iv)) as HariciSifreHariciSifreData,
            metadata: JSON.parse(await decryptWithAES(aesKey, hariciSifreDTO.encryptedMetadata, iv)) as HariciSifreMetadata,
            aesIV: hariciSifreDTO.aesIV
        };
        }));
        return hariciSifreDesifreListesi;
    }

    const karsilastir = (solHsd: HariciSifreDesifre, sagHsd: HariciSifreDesifre) => {
        return solHsd.metadata.url === sagHsd.metadata.url
            && solHsd.metadata.android === sagHsd.metadata.android
            && solHsd.data.kullaniciAdi === sagHsd.data.kullaniciAdi
            && solHsd.data.sifre === sagHsd.data.sifre;
    };

    const durum2Renk = (durum: HariciSifreDesifreIceriyeAktarDurum) => {
        switch (durum) {
            case HariciSifreDesifreIceriyeAktarDurum.EKLE:
                return '#90CAF9';
            case HariciSifreDesifreIceriyeAktarDurum.AKTIF:
                return '#C5E1A5';
            case HariciSifreDesifreIceriyeAktarDurum.GUNCELLE:
                return '#FFF59D';
            case HariciSifreDesifreIceriyeAktarDurum.SIL:
                return '#EF9A9A';
        }
    }

    const durum2Buton = (durum: HariciSifreDesifreIceriyeAktarDurum) => {
        switch (durum) {
            case HariciSifreDesifreIceriyeAktarDurum.EKLE:
                return 'Ekle';
            case HariciSifreDesifreIceriyeAktarDurum.AKTIF:
                return 'Aktif';
            case HariciSifreDesifreIceriyeAktarDurum.GUNCELLE:
                return 'Güncelle';
            case HariciSifreDesifreIceriyeAktarDurum.SIL:
                return 'Sil';
        }
    }

    const durum2Severity = (durum: HariciSifreDesifreIceriyeAktarDurum) => {
        switch (durum) {
            case HariciSifreDesifreIceriyeAktarDurum.EKLE:
                return 'info';
            case HariciSifreDesifreIceriyeAktarDurum.AKTIF:
                return 'success';
            case HariciSifreDesifreIceriyeAktarDurum.GUNCELLE:
                return 'warning';
            case HariciSifreDesifreIceriyeAktarDurum.SIL:
                return 'danger';
        }
    }

    const iceriAktarSifreListesiGetir = () : HariciSifreDesifreIceriyeAktar[] => {
             
        let sonuc: HariciSifreDesifreIceriyeAktar[] = [];
        for (let hariciSifreDesifre of hariciSifreDesifreListesi) {
            let dosyaHariciSifreDesifre = dosyaHariciSifreDesifreList.find(hsd => hsd.id === hariciSifreDesifre.id);
            let durum = HariciSifreDesifreIceriyeAktarDurum.SIL;
            if (dosyaHariciSifreDesifre) {
                if (karsilastir(hariciSifreDesifre, dosyaHariciSifreDesifre)) {
                    durum = HariciSifreDesifreIceriyeAktarDurum.AKTIF;
                } else {
                    durum = HariciSifreDesifreIceriyeAktarDurum.GUNCELLE;
                }

                if (farkliOlanlariGöster && durum === HariciSifreDesifreIceriyeAktarDurum.AKTIF) {
                    continue;
                }

                sonuc.push({
                    ...dosyaHariciSifreDesifre,
                    durum
                });
            } else {
                sonuc.push({
                    ...hariciSifreDesifre,
                    durum
                });
            }
        }

        for (let dosyaHariciSifreDesifre of dosyaHariciSifreDesifreList) {
            let hariciSifreDesifre = hariciSifreDesifreListesi.find(hsd => hsd.id === dosyaHariciSifreDesifre.id);
            if (!hariciSifreDesifre) {
                sonuc.push({
                    ...dosyaHariciSifreDesifre,
                    durum : HariciSifreDesifreIceriyeAktarDurum.EKLE
                });
            }
        }

        sonuc = sonuc.sort((sol, sag) => sol.durum - sag.durum);

        return sonuc;
    }

    const itemTemplate = (hsd: HariciSifreDesifreIceriyeAktar) => {
        if (!hsd) {
            return (
                <div style={{height: '75px'}}>

                </div>
            );
        }

        return (
            <div 
                className={classNames("col-12 hover:surface-hover cursor-pointer", { hariciSifreDesifreIceriAlSecili: hsd.id === seciliHariciSifreDesifreIceriAktarKimlik})} 
                style={{ height: '75px' }} 
                onClick={() => seciliHariciSifreDesifreIceriAktarKimlikDegistir(hsd.id)}
            >
                <div className='flex p-3 gap-3 align-items-center pl-3'>
                    <div>
                        <img src='/images/icon_32.png' height={32} width={32}/>
                    </div>
                    <div className='flex flex-column line-height-2 flex-grow-1'>
                        <div 
                            className='text-base text-overflow-ellipsis white-space-nowrap overflow-hidden w-25rem text-color'
                            title={hsd.metadata.url}
                        >
                            { hsd.metadata.url }
                        </div>
                        <div 
                            className='text-sm text-overflow-ellipsis white-space-nowrap overflow-hidden w-25rem text-color-secondary'
                            title={hsd.data.kullaniciAdi}
                        >
                            { hsd.data.kullaniciAdi }
                        </div>
                    </div>
                    <div style={{ width: '100px' }}>
                        <Button 
                            type="button" 
                            label={durum2Buton(hsd.durum)} 
                            severity={durum2Severity(hsd.durum)} 
                            className='w-full' 
                            onClick={() => {sifreDegistir(hsd)}} 
                            disabled={hsd.durum === HariciSifreDesifreIceriyeAktarDurum.AKTIF} 
                        />
                    </div>
                </div>
            </div>
        );
    };

   

    const sifreDegistir = async (hariciSifreDesifre: HariciSifreDesifreIceriyeAktar) => {

        const iv = generateIV();
        const aesKey = await deriveAesKey(sifre, kullanici.kullaniciKimlik);
        const encryptedData = await encryptWithAES(aesKey, JSON.stringify({ 
            kullaniciAdi: hariciSifreDesifre.data.kullaniciAdi, 
            sifre: hariciSifreDesifre.data.sifre
        } as HariciSifreHariciSifreData), iv);

        const encryptedMetadata = await encryptWithAES(aesKey, JSON.stringify({ 
            url: hariciSifreDesifre.metadata.url, 
            android: hariciSifreDesifre.metadata.android
        } as HariciSifreMetadata), iv);

    
        if (hariciSifreDesifre.durum === HariciSifreDesifreIceriyeAktarDurum.EKLE) {
            await HariciSifreApi.save({
                id: hariciSifreDesifre.id,
                encryptedData,
                encryptedMetadata,
                aesIV: uint8ArrayToBase64(iv),
            });
        } else if (hariciSifreDesifre.durum === HariciSifreDesifreIceriyeAktarDurum.GUNCELLE) {
            await HariciSifreApi.update(hariciSifreDesifre.id, {
                encryptedData,
                encryptedMetadata,
                aesIV: uint8ArrayToBase64(iv),
            });
        } else if (hariciSifreDesifre.durum === HariciSifreDesifreIceriyeAktarDurum.SIL) {
            await HariciSifreApi.delete(hariciSifreDesifre.id);
        }

        dispatch(sifreGuncelDurumBelirle(false));
       
    }

    const diyalogKapat = () => {
        diyalogGosterDegistir(false);
        dosyaHariciSifreDesifreListDegistir([]);
        farkliOlanlariGösterDegistir(false);
    }

    const hepsiniUygula = async () => {
        const aesKey = await deriveAesKey(sifre, kullanici.kullaniciKimlik);
        for (const hsd of iceriAktarSifreListesiGetir()) {
            if (hsd.durum === HariciSifreDesifreIceriyeAktarDurum.AKTIF) {
                continue;
            }

            const iv = generateIV();
            const encryptedData = await encryptWithAES(aesKey, JSON.stringify(hsd.data), iv);
            const encryptedMetadata = await encryptWithAES(aesKey, JSON.stringify(hsd.metadata), iv);
            const aesIV = uint8ArrayToBase64(iv);
            
            if (hsd.durum === HariciSifreDesifreIceriyeAktarDurum.EKLE) {
                await HariciSifreApi.save({
                    id: hsd.id,
                    encryptedData,
                    encryptedMetadata,
                    aesIV
                });
            } else if (hsd.durum === HariciSifreDesifreIceriyeAktarDurum.GUNCELLE) {
                await HariciSifreApi.update(hsd.id, {
                    encryptedData,
                    encryptedMetadata,
                    aesIV
                });
            } else if (hsd.durum === HariciSifreDesifreIceriyeAktarDurum.SIL) {
                await HariciSifreApi.delete(hsd.id);
            }
        }

        dispatch(sifreGuncelDurumBelirle(false));
        diyalogKapat();
    };

    const dialogFooter = (
        <div>
            <Button label="Hepsini Uygula" icon="pi pi-check" onClick={hepsiniUygula} className="p-button-primary mr-2" />
            <Button label="Kapat" icon="pi pi-times" onClick={diyalogKapat} className="p-button-text" />
        </div>
    );

    const seciliHariciSifreDesifreIceriAktar = iceriAktarSifreListesiGetir().find(hsd => hsd.id === seciliHariciSifreDesifreIceriAktarKimlik);

    return (
        <>
            <h3 className="mb-3">İçeriye Aktar</h3>
            <div className='card p-3'> 
                <FileUpload 
                    mode="basic" 
                    name="sifreler[]" 
                    url="/upload" 
                    accept=".json" 
                    maxFileSize={1000000} 
                    customUpload 
                    uploadHandler={dosyaSecilmesiniEleAl}
                    chooseLabel='Dosya Seç'
                    auto 
                />
                <Dialog 
                    header='Şifreleri Karşılaştır ve İçeri Aktar'
                    visible={diyalogGoster} 
                    style={{ width: '60vw', maxHeight: '70vh' }}
                    onHide={() => diyalogKapat()} 
                    footer={dialogFooter}
                >
                    <div className="p-field-checkbox flex align-items-center justify-content-end mb-2">
                        <label htmlFor="farkliOlanlarGoster" className='mr-2'>Sadece farklı olanları göster</label>
                        <Checkbox inputId="farkliOlanlarGoster" onChange={e => farkliOlanlariGösterDegistir(e.checked!)} checked={farkliOlanlariGöster}></Checkbox>
                    </div>

                    <div className='flex flex-row gap-5'>
                        <div className='flex flex-column flex-grow-1'> 
                            <div style={{ minHeight: '375px' }}> 
                                <DataView 
                                    value={iceriAktarSifreListesiGetir()} 
                                    itemTemplate={itemTemplate} 
                                    rows={5} 
                                    paginator 
                                    emptyMessage='Karşılaştırılacak veri bulunamadı.'
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport" 
                                    currentPageReportTemplate='{first}-{last} / {totalRecords}'
                                />
                            </div>
                        </div>
                        <div style={{ overflowY: 'auto', maxHeight: '55vh', width: '25rem', flexShrink: 0, paddingTop: '1rem' }}> 
                             <IceriyeAktarAyrinti hariciSifreDesifreIceriAktar={seciliHariciSifreDesifreIceriAktar} />
                        </div>
                    </div>
                </Dialog>
            </div>
        </>
    );
    

};

function dosyaOku(dosya: File): Promise<string> {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
  
        reader.readAsText(dosya);
    
        reader.onload = () => {
            resolve(reader.result as string);
        };
    
        reader.onerror = () => {
            reject(reader.error);
        };
    });
}

export default IceriyeAktar;