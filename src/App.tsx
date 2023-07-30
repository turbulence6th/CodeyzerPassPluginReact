import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, AygitYoneticiKullan, useAppDispatch } from '.';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { hariciSifreDesifreListesiBelirle, hariciSifreListesiBelirle, mesajBelirle, sifreGuncelDurumBelirle } from './ortak/CodeyzerReducer';
import axios from 'axios';
import { Cevap } from './ortak/Cevap';
import { MesajTipi } from './ortak/BildirimMesaji';
import { useTranslation } from 'react-i18next';
import { getir } from './ortak/HariciSifreApi';
import { HariciSifreIcerik } from './ortak/HariciSifreDTO';
import { desifreEt } from './ortak/CryptoUtil';

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
  const hariciSifreListesi = useSelector((state: RootState) => state.codeyzerDepoReducer.hariciSifreListesi);
  const kullanici = useSelector((state: RootState) => state.codeyzerDepoReducer.kullanici)!;
  const sifreGuncelDurum = useSelector((state: RootState) => state.codeyzerHafizaReducer.sifreGuncelDurum);

  useEffect(() => {
    axios.interceptors.response.clear();
    axios.interceptors.response.use((response) => {
      const cevap: Cevap<any> = response.data;
      if (!cevap.basarili) {
        toast.current!.show({ severity: 'error', detail: t(cevap.mesaj), sticky:true });
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
    } else if (app === 'SifreBulundu') {
      anaBilesenDegistir(lazy(() => import('./iframe/SifreBulundu')));
    } else {
      anaBilesenDegistir(lazy(() => import('./popup/Popup')));
    }

    if (isInPopup()) {
      const html = document.querySelector('html');
      html!.style.height = '600px';
      html!.style.width = '350px';
    }
  }, []);

  useEffect(() => {
    aygitYonetici?.mevcutDil().then(dil => {
      i18n.changeLanguage(dil);
    })
  }, [aygitYonetici]);

  useEffect(() => {
    if (mesaj) {
      toast.current!.show({ severity: mesajTip2PrimeType(mesaj.tip), detail: mesaj.icerik });
      dispatch(mesajBelirle(undefined));
    }
  }, [mesaj, dispatch]);

  useEffect(() => {
      if (!sifreGuncelDurum && kullanici) {
        (async () => {
          const cevap = await getir({ kullaniciKimlik: kullanici.kullaniciKimlik });
          dispatch(hariciSifreListesiBelirle(cevap.sonuc));
          dispatch(sifreGuncelDurumBelirle(true));
      })();
    }
  }, [sifreGuncelDurum, kullanici]);

  useEffect(() => {
    const hariciSifreDesifreListesi = hariciSifreListesi.map(x => {
        const hariciSifreIcerik: HariciSifreIcerik = JSON.parse(desifreEt(x.icerik, kullanici.sifre));
        return {
            kimlik: x.kimlik,
            icerik: hariciSifreIcerik,
        }
    });
    dispatch(hariciSifreDesifreListesiBelirle(hariciSifreDesifreListesi));
    aygitYonetici?.sifreListesiGuncelle();
  }, [hariciSifreListesi]);

  const isInPopup = function() {
    // @ts-ignore
    return window.chrome?.extension?.getViews({ type: "popup" })[0] === window;
  }

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
