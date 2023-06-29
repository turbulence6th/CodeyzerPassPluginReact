import { TFunction } from "i18next";
import { confirmDialog } from "primereact/confirmdialog";

export const dialogGoster = (t: TFunction, baslikAnahtar: string, mesajAnahtar: string, onay: () => {}) => {
    confirmDialog({
        message: t(mesajAnahtar),
        header: t(baslikAnahtar),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: t('popupOnayPanel.onayla.icerik'),
        rejectLabel: t('popupOnayPanel.iptal.icerik'),
        accept: onay
    });
}