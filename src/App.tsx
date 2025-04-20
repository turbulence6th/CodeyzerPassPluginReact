import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, AygitYoneticiKullan, useAppDispatch } from '.';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import {
  sifreBelirle, hariciSifreDesifreListesiBelirle,
  mesajBelirle, sifreGuncelDurumBelirle, yukleniyorBelirle,
  hariciSifreListesiBelirle,
  kullaniciBelirle
} from './ortak/CodeyzerReducer';
import { MesajTipi } from './ortak/BildirimMesaji';
import { useTranslation } from 'react-i18next';
import PasswordRequest from './ortak/PasswordRequest';
import { HariciSifreApi } from './ortak/HariciSifreApi';
import { HariciSifreDesifre, HariciSifreHariciSifreData, HariciSifreMetadata } from './ortak/HariciSifreDTO';
import { base64ToUint8Array, bcryptHash, checkBcrypt, decryptWithAES, deriveAesKey, sha512 } from './ortak/CryptoUtil';
import { api } from './ortak/SunucuApi';
import { KullaniciApi } from './ortak/KullaniciApi';
import { CodeyzerPassErrorResponseDTO } from './ortak/CodeyzerPassDTO';

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
    const reqInterceptor = api.interceptors.request.use(config => {
      dispatch(yukleniyorBelirle(true));
      if (kullanici?.accessToken) {
        config.headers.set('Authorization', `Bearer ${kullanici.accessToken}`);
      }
      return config;
    });
    const resInterceptor = api.interceptors.response.use(
      response => {
        dispatch(yukleniyorBelirle(false));
        return response;
      },
      async error => {
        const originalRequest = error.config;
      
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/api/kullanici/refresh')
        ) {
          originalRequest._retry = true;
      
          try {
            const refreshToken = kullanici.refreshToken;
            const refreshTokenResponse = await KullaniciApi.refreshToken({ refreshToken });
      
            const { accessToken, refreshToken: newRefreshToken } = refreshTokenResponse;
      
            dispatch(kullaniciBelirle({
              ...kullanici,
              accessToken,
              refreshToken: newRefreshToken
            }));
      
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            try {
              const sifreHash = await sha512(sifre);
      
              const loginResponse = await KullaniciApi.login({
                kullaniciKimlik: kullanici.kullaniciKimlik,
                sifreHash
              });
      
              const { accessToken, refreshToken } = loginResponse;
      
              dispatch(kullaniciBelirle({
                kullaniciKimlik: kullanici.kullaniciKimlik,
                sifreHash: await bcryptHash(sifre),
                accessToken,
                refreshToken
              }));
      
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return api(originalRequest);
            } catch (loginError) {
              // logout vs yönlendirme burada yapılabilir
              return Promise.reject(loginError);
            }
          }
        }
      
        const errorResponse = error.response?.data as CodeyzerPassErrorResponseDTO;
        toast.current?.show({ severity: 'error', detail: errorResponse?.error });
        dispatch(yukleniyorBelirle(false));
        return Promise.reject(error);
      }
    );
    return () => {
      api.interceptors.request.eject(reqInterceptor);
      api.interceptors.response.eject(resInterceptor);
    };
  }, [dispatch, kullanici]);

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
    api.defaults.baseURL = url;
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
            const hariciSifreDTOList = await HariciSifreApi.getAll();
            dispatch(hariciSifreListesiBelirle(hariciSifreDTOList));
        } finally {
            dispatch(sifreGuncelDurumBelirle(true));
        }
      })();
    }
  }, [sifreGuncelDurum, kullanici, dispatch]);

  // 7. Harici şifreleri desifre et
  useEffect(() => {
    hariciSifreDesifreEt();
  }, [hariciSifreListesi, sifre, dispatch, aygitYonetici]);

  const hariciSifreDesifreEt = async () => {
    if (sifre) {
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
      dispatch(hariciSifreDesifreListesiBelirle(hariciSifreDesifreListesi));
      aygitYonetici?.sifreListesiGuncelle();
    }
  }
  
  // 8. Ana şifre kontrol ve kaydet
  const anaSifreKaydet = async (s: string) => {
    if (await checkBcrypt(s, kullanici.sifreHash)) {
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
