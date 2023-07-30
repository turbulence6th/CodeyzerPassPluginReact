import { TFunction } from "i18next";
import { confirmDialog } from "primereact/confirmdialog";

export const dialogGoster = (t: TFunction, baslik: string, mesaj: React.ReactNode, onay: () => {}) => {
    confirmDialog({
        message: mesaj,
        header: baslik,
        acceptLabel: t('popupOnayPanel.onayla.icerik'),
        rejectLabel: t('popupOnayPanel.iptal.icerik'),
        accept: onay,
        closable: false
    });
}