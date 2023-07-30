package com.codeyzer.android.dto;

import java.io.Serializable;

public class HariciSifreDesifre implements Serializable {

    private String kimlik;
    private HariciSifreIcerik icerik;
    private String alanAdi;

    public String getKimlik() {
        return kimlik;
    }

    public void setKimlik(String kimlik) {
        this.kimlik = kimlik;
    }

    public HariciSifreIcerik getIcerik() {
        return icerik;
    }

    public void setIcerik(HariciSifreIcerik icerik) {
        this.icerik = icerik;
    }

    public String getAlanAdi() {
        return alanAdi;
    }

    public void setAlanAdi(String alanAdi) {
        this.alanAdi = alanAdi;
    }
}
