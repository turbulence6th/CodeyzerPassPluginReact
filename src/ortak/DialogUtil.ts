import { TFunction } from "i18next";
import { confirmDialog } from "primereact/confirmdialog";

export const dialogGoster = (t: TFunction, baslik: string, mesaj: React.ReactNode, onay: () => void, iptal: () => void = () => {}) => {
    confirmDialog({
        message: mesaj,
        header: baslik,
        acceptLabel: t('popupOnayPanel.onayla.icerik'),
        rejectLabel: t('popupOnayPanel.iptal.icerik'),
        accept: onay,
        reject: iptal,
        closable: false
    });
}