import React, { useEffect } from 'react';
import AnaEkranSifreler from './AnaEkranSifreler';
import AnaEkranSifreEkle from './AnaEkranSifreEkle';
import { TabView, TabPanel } from 'primereact/tabview';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '..';
import { aktifAnaEkranTabBelirle } from '../store/CodeyzerReducer';
import AnaEkranAyarlar from './AnaEkranAyarlar';
import AnaEkranTabEnum from './AnaEkranTabEnum';

const AnaEkran = () => {

    const aktifTab = useSelector((state: RootState) => state.codeyzerHafizaReducer.aktifAnaEkranTabEnum);
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(aktifAnaEkranTabBelirle(AnaEkranTabEnum.SIFRELER));
    }, []);

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