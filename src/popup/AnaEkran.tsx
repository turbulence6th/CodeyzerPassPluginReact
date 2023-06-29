import React, { useEffect } from 'react';
import AnaEkranSifreler from './AnaEkranSifreler';
import AnaEkranSifreEkle from './AnaEkranSifreEkle';
import { HariciSifreIcerik } from '../ortak/HariciSifreDTO';
import { getir } from '../ortak/HariciSifreApi';
import { desifreEt } from '../ortak/CryptoUtil';
import { TabView, TabPanel } from 'primereact/tabview';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '..';
import { hariciSifreDesifreListesiBelirle, sifreGuncelDurumBelirle, aktifAnaEkranTabBelirle } from '../ortak/CodeyzerReducer';
import AnaEkranAyarlar from './AnaEkranAyarlar';
import AnaEkranTabEnum from './AnaEkranTabEnum';

const AnaEkran = () => {

    const kullanici = useSelector((state: RootState) => state.codeyzerDepoReducer.kullanici)!;
    const aktifTab = useSelector((state: RootState) => state.codeyzerHafizaReducer.aktifAnaEkranTabEnum);
    const sifreGuncelDurum = useSelector((state: RootState) => state.codeyzerHafizaReducer.sifreGuncelDurum);
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(aktifAnaEkranTabBelirle(AnaEkranTabEnum.SIFRELER));
    }, []);

    useEffect(() => {
        if (!sifreGuncelDurum) {
            sifreGetir();
        }
    }, [sifreGuncelDurum]);

    const sifreGetir = async () => {
        const cevap = await getir({ kullaniciKimlik: kullanici.kullaniciKimlik });
        const hariciSifreDesifreListesi = cevap.sonuc.map(x => {
            const hariciSifreIcerik: HariciSifreIcerik = JSON.parse(desifreEt(x.icerik, kullanici.sifre));
            return {
                kimlik: x.kimlik,
                icerik: hariciSifreIcerik,
            }
        });
        dispatch(hariciSifreDesifreListesiBelirle(hariciSifreDesifreListesi));
        dispatch(sifreGuncelDurumBelirle(true));
    };

    return (
        <TabView activeIndex={aktifTab} onTabChange={(e) => dispatch(aktifAnaEkranTabBelirle(e.index))}>
            <TabPanel header={<i className="pi pi-briefcase" style={{ fontSize: '2rem' }}></i>}>
                <AnaEkranSifreler/>
            </TabPanel>
            <TabPanel header={<i className="pi pi-file-edit" style={{ fontSize: '2rem' }}></i>}>
                <AnaEkranSifreEkle/>
            </TabPanel>
            <TabPanel header={<i className="pi pi-cog" style={{ fontSize: '2rem' }}></i>}>
                <AnaEkranAyarlar/>
            </TabPanel>
        </TabView>
    );
};

export default AnaEkran;