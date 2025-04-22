import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { RadioButton } from "primereact/radiobutton";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "..";

const DisariyaAktar = () => {

    const [disaAktarSifreli, disaAktarSifreliDegistir] = useState(true);
    const [disaAktarFormat, disaAktarFormatDegistir] = useState('json');

    const kullanici = useSelector((state: RootState) => state.codeyzerDepoReducer.kullanici);
    const hariciSifreListesi = useSelector((state: RootState) => state.codeyzerDepoReducer.hariciSifreListesi);
    const hariciSifreDesifreListesi = useSelector((state: RootState) => state.codeyzerHafizaReducer.hariciSifreDesifreListesi);

    const indir = (icerik: string) => {
        var blob = new Blob([icerik], {type: 'text/plain'});
        var hiddenElement = document.createElement('a');
        hiddenElement.href = window.URL.createObjectURL(blob);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'yedek.' + disaAktarFormat;
        hiddenElement.click();
    }

    const disaAktarTiklandi = () => {
        let icerik = '';
        if (disaAktarSifreli) {
            if (disaAktarFormat === 'json') {
                icerik = JSON.stringify(hariciSifreListesi);
            } else if (disaAktarFormat === 'csv') {
                icerik = hariciSifreListesi.map(hs => `"${hs.id}","${hs.encryptedData}","${hs.encryptedMetadata}","${hs.aesIV}"`).reduce((x, y) => x + "\r\n" + y);
            }
        } else {
            if (disaAktarFormat === 'json') {
                icerik = JSON.stringify(hariciSifreDesifreListesi);
            } else if (disaAktarFormat === 'csv') {
                icerik = hariciSifreDesifreListesi.map(hs => `"${hs.id}","${hs.data.kullaniciAdi}","${hs.data.sifre}","${hs.metadata.url}","${hs.metadata.android}","${hs.aesIV}"`).reduce((x, y) => x + "\r\n" + y);
            }
        }
        
        indir(icerik);
    };

    return (
        <>
            <h3 className="mb-3">Dışarıya Aktar</h3>
            <div className="p-field-checkbox mb-3">
                <Checkbox inputId="sifreliAktar" onChange={e => disaAktarSifreliDegistir(e.checked!)} checked={disaAktarSifreli} />
                <label htmlFor="sifreliAktar" className="ml-2">Şifrelenmiş haliyle aktar</label>
            </div>
            <div className="flex flex-wrap gap-3 mb-3">
                <div className="p-field-radiobutton">
                    <RadioButton inputId="json" value="json" onChange={(e) => disaAktarFormatDegistir(e.value)} checked={disaAktarFormat === 'json'} />
                    <label htmlFor="json" className="ml-2">Json</label>
                </div>
                <div className="p-field-radiobutton">
                    <RadioButton inputId="csv" value="csv" onChange={(e) => disaAktarFormatDegistir(e.value)} checked={disaAktarFormat === 'csv'} />
                    <label htmlFor="csv" className="ml-2">Csv</label>
                </div>
            </div>
            <div className='p-field'>
                <Button 
                    type='button' 
                    label='Aktar'
                    onClick={disaAktarTiklandi} 
                />
            </div>
        </>
    );
};

export default DisariyaAktar;