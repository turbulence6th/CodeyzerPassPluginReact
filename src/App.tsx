import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, AygitYoneticiKullan, useAppDispatch } from '.';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { mesajBelirle } from './ortak/CodeyzerReducer';
import axios from 'axios';
import { Cevap } from './ortak/Cevap';
import { MesajTipi } from './ortak/BildirimMesaji';
import { useTranslation } from 'react-i18next';

const mesajTip2PrimeType = (tip: MesajTipi) => {
  switch(tip) {
    case MesajTipi.BILGI:
      return 'info';
    case MesajTipi.UYARI:
      return 'warn';
    case MesajTipi.HATA:
      return 'error';
  }
}

function App() {
  const mesaj = useSelector((state: RootState) => state.codeyzerHafizaReducer.mesaj);
  const aygitYonetici = AygitYoneticiKullan();
  const toast = useRef<Toast>(null);
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const [AnaBilesen, anaBilesenDegistir] = useState<React.LazyExoticComponent<() => JSX.Element>>();

  useEffect(() => {
    axios.interceptors.response.clear();
    axios.interceptors.response.use((response) => {
      const cevap: Cevap<any> = response.data;
      if (!cevap.basarili) {
        toast.current!.show({ severity: 'error', detail: t(cevap.mesaj) });
      }
      return response;
    }, error => {
      toast.current!.show({ severity: 'error', detail: 'Beklenmedik bir hata oluştu' });
      return Promise.reject(error);
    });

    const parametreler = new URLSearchParams(document.location.search)
    const app = parametreler.get('app');

    if (app === 'GelismisAyarlar') {
      anaBilesenDegistir(lazy(() => import('./iframe/GelismisAyarlar')));
    } else {
      anaBilesenDegistir(lazy(() => import('./popup/Popup')));
      document.body.style.height = '600px';
      document.body.style.width = '394px';
    }
  }, []);

  useEffect(() => {
    aygitYonetici?.mevcutDil().then(dil => {
      i18n.changeLanguage(dil);
    })
  }, [aygitYonetici])

  useEffect(() => {
    if (mesaj) {
      toast.current!.show({ severity: mesajTip2PrimeType(mesaj.tip), detail: mesaj.icerik });
      dispatch(mesajBelirle(undefined));
    }
  }, [mesaj, dispatch]);

  return (
    <>
      <Suspense>
        { AnaBilesen && <AnaBilesen/> }
      </Suspense>
      <Toast ref={toast} position="bottom-center" />
      <ConfirmDialog />
    </>
  )
}

export default App;
