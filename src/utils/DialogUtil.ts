// import { TFunction } from "i18next"; // Removed
import { confirmDialog } from "primereact/confirmdialog";

export const dialogGoster = (baslik: string, mesaj: React.ReactNode, onay: () => void, iptal: () => void = () => {}) => {
    confirmDialog({
        message: mesaj,
        header: baslik,
        acceptLabel: 'Onayla',
        rejectLabel: 'İptal',
        accept: onay,
        reject: iptal,
        closable: false
    });
} 