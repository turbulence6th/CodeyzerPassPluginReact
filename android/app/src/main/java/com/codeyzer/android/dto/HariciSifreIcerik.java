package com.codeyzer.android.dto;

import java.io.Serializable;

public class HariciSifreIcerik implements Serializable {

    private String platform;
    private String androidPaket;
    private String kullaniciAdi;
    private String sifre;

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getAndroidPaket() {
        return androidPaket;
    }

    public void setAndroidPaket(String androidPaket) {
        this.androidPaket = androidPaket;
    }

    public String getKullaniciAdi() {
        return kullaniciAdi;
    }

    public void setKullaniciAdi(String kullaniciAdi) {
        this.kullaniciAdi = kullaniciAdi;
    }

    public String getSifre() {
        return sifre;
    }

    public void setSifre(String sifre) {
        this.sifre = sifre;
    }
}
