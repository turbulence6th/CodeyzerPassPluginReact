enum MesajTipi {
    BILGI,
    UYARI,
    HATA
}

interface BildirimMesaji {
    tip: MesajTipi
    icerik: string
}

export {
    MesajTipi
};
export default BildirimMesaji;