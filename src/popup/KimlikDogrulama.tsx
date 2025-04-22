import { InputText } from 'primereact/inputtext';
import { AygitYoneticiKullan, RootState, useAppDispatch } from '..';
import { sifreBelirle, sifreGuncelDurumBelirle, urlBelirle, kullaniciBelirle } from '../store/CodeyzerReducer';
import { classNames } from 'primereact/utils';
import { useSelector } from 'react-redux';
import { KullaniciApi } from '../services/KullaniciApi';
import { TabView, TabPanel } from 'primereact/tabview';
import OturumAcFormu from './OturumAcFormu';
import KayitOlFormu from './KayitOlFormu';
import { AuthService } from '../services/AuthService';

const KimlikDogrulama = () => {
    
    const url = useSelector((state: RootState) => state.codeyzerDepoReducer.url);
    const dispatch = useAppDispatch();
    const aygitYonetici = AygitYoneticiKullan();

    const oturumAc = async (kullaniciAdi: string, sifre: string) => {

        const authService = await AuthService.createByKullaniciAdi(kullaniciAdi, sifre);
        
        const kullaniciKimlik = authService.kullaniciKimlikGetir();
        const sifreHash = await authService.sifreSha512Olustur();

        const { accessToken, refreshToken } = await KullaniciApi.login({
            kullaniciKimlik,
            sifreHash
        });

        dispatch(kullaniciBelirle({
            kullaniciKimlik,
            sifreHash: await authService.sifreBcryptHashOlustur(),
            accessToken,
            refreshToken
        }));
        aygitYonetici?.anaSifreKaydet(sifre);
        dispatch(sifreBelirle(sifre));
        dispatch(sifreGuncelDurumBelirle(false));
    };

    const kayitOl = async (kullaniciAdi: string, sifre: string) => {

        const authService = await AuthService.createByKullaniciAdi(kullaniciAdi, sifre);

        const kullaniciKimlik = authService.kullaniciKimlikGetir();
        const sifreHash = await authService.sifreSha512Olustur();

        const { accessToken, refreshToken } = await KullaniciApi.register({
            kullaniciKimlik,
            sifreHash
        });

        dispatch(kullaniciBelirle({
            kullaniciKimlik,
            sifreHash: await authService.sifreBcryptHashOlustur(),
            accessToken,
            refreshToken
        }));
        aygitYonetici?.anaSifreKaydet(sifre);
        dispatch(sifreBelirle(sifre));
        dispatch(sifreGuncelDurumBelirle(false));
    };

    const urlDegistir = (yeniUrl: string) => {
        dispatch(urlBelirle(yeniUrl));
    }
      
    return (
        <div className="px-2">
            <div className="p-field mb-3 mt-3"> 
                <span className="p-float-label">
                    <InputText 
                        id="url" 
                        type='text' 
                        value={url} 
                        onChange={(e) => urlDegistir(e.target.value)} 
                        className={classNames('w-full')} 
                    />
                    <label htmlFor="url">Sunucu Url</label>
                </span>
            </div>

            <TabView>
                <TabPanel header="Oturum Aç">
                    <OturumAcFormu onSubmit={oturumAc} />
                </TabPanel>
                <TabPanel header="Kayıt Ol">
                    <KayitOlFormu onSubmit={kayitOl} />
                </TabPanel>
            </TabView>
        </div>
    );
}

export default KimlikDogrulama; 