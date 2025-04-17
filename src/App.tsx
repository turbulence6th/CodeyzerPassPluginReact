import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, AygitYoneticiKullan, useAppDispatch } from '.';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import {
  sifreBelirle, hariciSifreDesifreListesiBelirle, hariciSifreListesiBelirle,
  mesajBelirle, sifreGuncelDurumBelirle, yukleniyorBelirle
} from './ortak/CodeyzerReducer';
import axios from 'axios';
import { Cevap } from './ortak/Cevap';
import { MesajTipi } from './ortak/BildirimMesaji';
import { useTranslation } from 'react-i18next';
import { getir } from './ortak/HariciSifreApi';
import { HariciSifreIcerik } from './ortak/HariciSifreDTO';
import { desifreEt, hashle } from './ortak/CryptoUtil';
import PasswordRequest from './ortak/PasswordRequest';

const mesajTip2PrimeType = (tip: MesajTipi): 'info' | 'warn' | 'error' => {
  switch (tip) {
      case MesajTipi.BILGI:
          return 'info';
      case MesajTipi.UYARI:
          return 'warn';
      case MesajTipi.HATA:
          return 'error';
      default:
          throw new Error('Geçersiz mesaj tipi'); // Hata durumu
  }
};

const isInPopup = () =>
  window.chrome?.extension?.getViews({ type: "popup" })[0] === window;

function App() {
  const dispatch = useAppDispatch();
  const toast = useRef<Toast>(null);
  const { t, i18n } = useTranslation();
  const aygitYonetici = AygitYoneticiKullan();

  const [AnaBilesen, anaBilesenDegistir] = useState<React.LazyExoticComponent<() => JSX.Element>>();

  const mesaj = useSelector((state: RootState) => state.codeyzerHafizaReducer.mesaj);
  const sifre = useSelector((state: RootState) => state.codeyzerHafizaReducer.sifre);
  const sifreGuncelDurum = useSelector((state: RootState) => state.codeyzerHafizaReducer.sifreGuncelDurum);
  const hariciSifreListesi = useSelector((state: RootState) => state.codeyzerDepoReducer.hariciSifreListesi);
  const kullanici = useSelector((state: RootState) => state.codeyzerDepoReducer.kullanici)!;
  const url = useSelector((state: RootState) => state.codeyzerDepoReducer.url);

  // 1. Axios interceptor setup
  useEffect(() => {
    const reqInterceptor = axios.interceptors.request.use(config => {
      dispatch(yukleniyorBelirle(true));
      return config;
    });
    const resInterceptor = axios.interceptors.response.use(
      response => {
        const cevap: Cevap<any> = response.data;
        if (!cevap.basarili) {
          toast.current?.show({ severity: 'error', detail: t(cevap.mesaj), sticky: true });
        }
        dispatch(yukleniyorBelirle(false));
        return response;
      },
      error => {
        toast.current?.show({ severity: 'error', detail: 'Beklenmedik bir hata oluştu' });
        dispatch(yukleniyorBelirle(false));
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, [dispatch, t]);

  // 2. Ana bileşen yükleme
  useEffect(() => {
    const parametreler = new URLSearchParams(document.location.search);
    const app = parametreler.get('app');

    anaBilesenDegistir(
      lazy(() =>
        app === 'GelismisAyarlar'
          ? import('./iframe/GelismisAyarlar')
          : import('./popup/Popup')
      )
    );

    if (isInPopup()) {
      const html = document.querySelector('html');
      if (html) {
        html.style.height = '600px';
        html.style.width = '350px';
      }
    }
  }, []);

  // 3. URL değişince axios baseURL güncelle
  useEffect(() => {
    axios.defaults.baseURL = url;
  }, [url]);

  // 4. Dil ve ana şifre getir
  useEffect(() => {
    aygitYonetici?.mevcutDil().then(dil => i18n.changeLanguage(dil));
    aygitYonetici?.anaSifreGetir().then(anaSifre => {
      if (anaSifre) dispatch(sifreBelirle(anaSifre));
    });
  }, [aygitYonetici, i18n, dispatch]);

  // 5. Mesaj gösterimi
  useEffect(() => {
    if (mesaj) {
      toast.current?.show({ severity: mesajTip2PrimeType(mesaj.tip), detail: mesaj.icerik });
      dispatch(mesajBelirle(undefined));
    }
  }, [mesaj, dispatch]);

  // 6. Harici şifreleri getir
  useEffect(() => {
    if (!sifreGuncelDurum && kullanici) {
      (async () => {
        try {
          const cevap = await getir({ kullaniciKimlik: kullanici.kullaniciKimlik });
          dispatch(hariciSifreListesiBelirle(cevap.sonuc));
        } finally {
          dispatch(sifreGuncelDurumBelirle(true));
        }
      })();
    }
  }, [sifreGuncelDurum, kullanici, dispatch]);

  // 7. Harici şifreleri desifre et
  useEffect(() => {
    if (sifre) {
      const liste = hariciSifreListesi.map(x => ({
        kimlik: x.kimlik,
        icerik: JSON.parse(desifreEt(x.icerik, sifre)) as HariciSifreIcerik
      }));
      dispatch(hariciSifreDesifreListesiBelirle(liste));
      aygitYonetici?.sifreListesiGuncelle();
    }
  }, [hariciSifreListesi, sifre, dispatch, aygitYonetici]);

  // 8. Ana şifre kontrol ve kaydet
  const anaSifreKaydet = (s: string) => {
    if (kullanici.sifreHash === hashle(s)) {
      aygitYonetici?.anaSifreKaydet(s);
      dispatch(sifreBelirle(s));
    }
  }

  return (
    <>
      {sifre || !kullanici
        ? <Suspense>{AnaBilesen && <AnaBilesen />}</Suspense>
        : <PasswordRequest onSubmit={anaSifreKaydet} />}
      <Toast ref={toast} position="bottom-center" />
      <ConfirmDialog />
    </>
  );
}

export default App;
