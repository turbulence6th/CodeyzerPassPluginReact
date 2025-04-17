import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { HariciSifreDTO, HariciSifreDesifre, HariciSifreIcerik } from '../ortak/HariciSifreDTO';
import { Dialog } from 'primereact/dialog';
import { useRef, useState } from 'react';
import { DataView } from 'primereact/dataview';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '..';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { guncelle, kaydet, sil } from '../ortak/HariciSifreApi';
import { desifreEt, sifrele } from '../ortak/CryptoUtil';
import { sifreGuncelDurumBelirle } from '../ortak/CodeyzerReducer';
import IceriyeAktarAyrinti from './IceriyeAktarAyrinti';
import { classNames } from 'primereact/utils';
import { dialogGoster } from '../ortak/DialogUtil';
import { useTranslation } from 'react-i18next';
import { InputText } from 'primereact/inputtext';

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
    const { t } = useTranslation();
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
                    dialogGoster(t, 'Dosyanın şifresini giriniz', body, () => {
                        resolve(null);
                    }, () => {
                        error();
                    });
                });
            } catch(e) {
                return;
            }

            const dosyaDesifreler = sifreler.map(x => {
                const hariciSifreIcerik: HariciSifreIcerik = JSON.parse(desifreEt(x.icerik, sifre));
                return {
                    kimlik: x.kimlik,
                    icerik: hariciSifreIcerik,
                }
            });

            dosyaHariciSifreDesifreListDegistir(dosyaDesifreler as HariciSifreDesifre[]);
        } else {
            dosyaHariciSifreDesifreListDegistir(sifreler as HariciSifreDesifre[]);
        }

        
        diyalogGosterDegistir(true);
        event.options.clear();
    };

    const karsilastir = (solHsd: HariciSifreDesifre, sagHsd: HariciSifreDesifre) => {
        return solHsd.icerik.platform === sagHsd.icerik.platform
            && solHsd.icerik.androidPaket === sagHsd.icerik.androidPaket
            && solHsd.icerik.kullaniciAdi === sagHsd.icerik.kullaniciAdi
            && solHsd.icerik.sifre === sagHsd.icerik.sifre;
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
            let dosyaHariciSifreDesifre = dosyaHariciSifreDesifreList.find(hsd => hsd.kimlik === hariciSifreDesifre.kimlik);
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
            let hariciSifreDesifre = hariciSifreDesifreListesi.find(hsd => hsd.kimlik === dosyaHariciSifreDesifre.kimlik);
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
            <div className={classNames("col-12", { hariciSifreDesifreIceriAlSecili: hsd.kimlik === seciliHariciSifreDesifreIceriAktarKimlik})} 
                style={{color: durum2Renk(hsd.durum), height: '75px'}} 
                onClick={() => seciliHariciSifreDesifreIceriAktarKimlikDegistir(hsd.kimlik)}
            >
                <div className='flex p-3 gap-3 align-items-center pl-5'>
                    <div>
                        <img src='/images/icon_32.png' height={32} width={32}/>
                    </div>
                    <div className='flex flex-column line-height-2 flex-grow-1'>
                        <div 
                            className='text-base text-overflow-ellipsis white-space-nowrap overflow-hidden w-25rem'
                            title={hsd.icerik.platform}
                        >
                            { hsd.icerik.platform }
                        </div>
                        <div 
                            className='text-sm text-overflow-ellipsis white-space-nowrap overflow-hidden w-25rem'
                            title={hsd.icerik.kullaniciAdi}
                        >
                            { hsd.icerik.kullaniciAdi }
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
        if (hariciSifreDesifre.durum === HariciSifreDesifreIceriyeAktarDurum.EKLE) {
            await kaydet({
                kimlik: hariciSifreDesifre.kimlik,
                icerik: sifrele(JSON.stringify(hariciSifreDesifre.icerik), sifre),
                kullaniciKimlik: kullanici.kullaniciKimlik
            });
        } else if (hariciSifreDesifre.durum === HariciSifreDesifreIceriyeAktarDurum.GUNCELLE) {
            await guncelle({
                kimlik: hariciSifreDesifre.kimlik,
                icerik: sifrele(JSON.stringify(hariciSifreDesifre.icerik), sifre),
                kullaniciKimlik: kullanici.kullaniciKimlik
            });
        } else if (hariciSifreDesifre.durum === HariciSifreDesifreIceriyeAktarDurum.SIL) {
            await sil({
                kimlik: hariciSifreDesifre.kimlik,
                kullaniciKimlik: kullanici.kullaniciKimlik
            });
        }

        dispatch(sifreGuncelDurumBelirle(false));
    }

    const diyalogKapat = () => {
        diyalogGosterDegistir(false);
        dosyaHariciSifreDesifreListDegistir([]);
    };

    const iceriAktarSifreListesi = iceriAktarSifreListesiGetir();
    const seciliHariciSİfreDesifreIceriAktar = iceriAktarSifreListesi.find(hsd => hsd.kimlik === seciliHariciSifreDesifreIceriAktarKimlik);

    return (
        <>
            <h3>İçeriye Aktar</h3>
            <FileUpload 
                mode="basic" 
                accept="*/*" 
                maxFileSize={1000000} 
                uploadHandler={dosyaSecilmesiniEleAl} 
                auto 
                chooseLabel="Şifre dosyası ekle" 
                customUpload
            />
            <Dialog header="İçeriye aktar" visible={diyalogGoster} style={{ width: '60vw', height: '35vw' }} onHide={diyalogKapat}>
                <div className='flex flex-row gap-5'>
                    <div className='flex flex-column'>
                        <div className="flex align-items-center">
                            <Checkbox 
                                inputId="farkliOlaniGoster" 
                                onChange={e => farkliOlanlariGösterDegistir(e.checked!)} 
                                checked={farkliOlanlariGöster} 
                            />
                            <label htmlFor="farkliOlaniGoster" className="ml-2">Sadace farklı şifreleri göster</label>
                        </div>
                        <div style={{width: '1000px', height: '500px'}}>
                            <DataView 
                                value={iceriAktarSifreListesi} 
                                itemTemplate={itemTemplate} 
                                paginator 
                                rows={5} 
                                className='mt-3'
                                emptyMessage='Şifre bulunamadı'
                            />
                        </div>
                    </div>
                    <div className='mt-5' style={{width: '1000px'}}>
                        <IceriyeAktarAyrinti hariciSifreDesifreIceriAktar={seciliHariciSİfreDesifreIceriAktar}/>
                    </div>
                </div>
                
            </Dialog>
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