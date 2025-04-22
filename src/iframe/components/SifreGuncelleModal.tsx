import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { HariciSifreDesifre, HariciSifreHariciSifreData, HariciSifreMetadata } from '../../types/HariciSifreDTO';
import { RootState, useAppDispatch } from '../..';
import { useSelector } from 'react-redux';
import { deriveAesKey, encryptWithAES, generateIV, uint8ArrayToBase64 } from '../../utils/CryptoUtil';
import { HariciSifreApi } from '../../services/HariciSifreApi';
import { mesajBelirle, sifreGuncelDurumBelirle } from '../../store/CodeyzerReducer';
import { MesajTipi } from '../../types/BildirimMesaji';

// Interface for the update form (can be kept here or moved to a types file)
interface GuncelleFormu {
    url: string;
    android: string;
    kullaniciAdi: string;
    sifre: string;
}

const VARSAYILAN_GUNCELLE_FORMU: GuncelleFormu = {
    url: '',
    android: '',
    kullaniciAdi: '',
    sifre: ''
};

interface SifreGuncelleModalProps {
    visible: boolean;
    onHide: () => void;
    sifreToUpdate: HariciSifreDesifre | null; // Pass the whole object
}

const SifreGuncelleModal: React.FC<SifreGuncelleModalProps> = ({ visible, onHide, sifreToUpdate }) => {
    const [guncelleFormu, guncelleFormuDegistir] = useState<GuncelleFormu>(VARSAYILAN_GUNCELLE_FORMU);
    const [modalSifreGoster, modalSifreGosterDegistir] = useState(false);
    const dispatch = useAppDispatch();
    const kullanici = useSelector((state: RootState) => state.codeyzerDepoReducer.kullanici)!;
    const anaSifre = useSelector((state: RootState) => state.codeyzerHafizaReducer.sifre);

    // Effect to populate form when sifreToUpdate changes (modal opens)
    useEffect(() => {
        if (sifreToUpdate) {
            guncelleFormuDegistir({
                url: sifreToUpdate.metadata.url || '',
                android: sifreToUpdate.metadata.android || '',
                kullaniciAdi: sifreToUpdate.data.kullaniciAdi || '',
                sifre: sifreToUpdate.data.sifre || ''
            });
            modalSifreGosterDegistir(false); // Reset password visibility
        } else {
            guncelleFormuDegistir(VARSAYILAN_GUNCELLE_FORMU); // Clear form when closing/no data
            modalSifreGosterDegistir(false);
        }
    }, [sifreToUpdate]);


    const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        guncelleFormuDegistir(prevForm => ({
            ...prevForm,
            [name]: value
        }));
    };

    const modalGuncelleTiklandi = async () => {
        if (!sifreToUpdate || !kullanici || !anaSifre) return;

        try {
            const iv = generateIV();
            const aesKey = await deriveAesKey(anaSifre, kullanici.kullaniciKimlik);

            const dataToEncrypt: HariciSifreHariciSifreData = {
                kullaniciAdi: guncelleFormu.kullaniciAdi,
                sifre: guncelleFormu.sifre
            };
            const metadataToEncrypt: HariciSifreMetadata = {
                url: guncelleFormu.url,
                android: guncelleFormu.android
            };

            const encryptedData = await encryptWithAES(aesKey, JSON.stringify(dataToEncrypt), iv);
            const encryptedMetadata = await encryptWithAES(aesKey, JSON.stringify(metadataToEncrypt), iv);

            await HariciSifreApi.update(sifreToUpdate.id!, {
                encryptedData,
                encryptedMetadata,
                aesIV: uint8ArrayToBase64(iv),
            });

            dispatch(sifreGuncelDurumBelirle(false)); // Refresh the list in parent
            dispatch(mesajBelirle({ tip: MesajTipi.BILGI, icerik: 'Şifre güncellendi.' }));
            onHide(); // Close the modal

        } catch (error) {
            console.error("Şifre güncellenirken hata:", error);
            dispatch(mesajBelirle({ tip: MesajTipi.HATA, icerik: 'Şifre güncellenirken bir hata oluştu.' }));
        }
    };

    const modalFooter = (
        <div>
            <Button label="İptal" icon="pi pi-times" onClick={onHide} className="p-button-text" />
            <Button label="Güncelle" icon="pi pi-check" onClick={modalGuncelleTiklandi} autoFocus />
        </div>
    );

    return (
        <Dialog
            header="Şifre Güncelle"
            visible={visible}
            style={{ width: '450px' }}
            modal
            footer={modalFooter}
            onHide={onHide}
        >
            {sifreToUpdate && ( // Only render content if there's data
                <div className="p-fluid flex flex-column gap-3 mt-3">
                    <div className="p-field">
                        <span className="p-float-label">
                            <InputText
                                id="url"
                                name="url"
                                value={guncelleFormu.url}
                                onChange={handleFormChange}
                                className="w-full"
                                inputMode='url'
                            />
                            <label htmlFor="url">Url</label>
                        </span>
                    </div>
                    <div className="p-field">
                        <span className="p-float-label">
                            <InputText
                                id="android"
                                name="android"
                                value={guncelleFormu.android}
                                onChange={handleFormChange}
                                className="w-full"
                            />
                            <label htmlFor="android">Android Paket Adı</label>
                        </span>
                    </div>
                    <div className="p-field">
                        <span className="p-float-label">
                            <InputText
                                id="kullaniciAdi"
                                name="kullaniciAdi"
                                value={guncelleFormu.kullaniciAdi}
                                onChange={handleFormChange}
                                className="w-full"
                                inputMode='email'
                            />
                            <label htmlFor="kullaniciAdi">Kullanıcı Adı</label>
                        </span>
                    </div>
                    <div className="p-field">
                        <div className="p-inputgroup">
                            <span className="p-float-label">
                                <InputText
                                    id="sifre"
                                    name="sifre"
                                    type={modalSifreGoster ? 'text' : 'password'}
                                    value={guncelleFormu.sifre}
                                    onChange={handleFormChange}
                                    className='w-full'
                                />
                                <label htmlFor="sifre">Şifre</label>
                            </span>
                            <Button type="button" icon={"pi " + (modalSifreGoster ? "pi-eye" : "pi-eye-slash")} className="p-button-secondary p-button-outlined" onClick={() => modalSifreGosterDegistir(!modalSifreGoster)} />
                        </div>
                    </div>
                </div>
            )}
        </Dialog>
    );
};

export default SifreGuncelleModal; 