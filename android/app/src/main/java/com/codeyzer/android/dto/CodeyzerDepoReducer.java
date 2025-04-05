package com.codeyzer.android.dto;

import java.util.List;

public class CodeyzerDepoReducer {

    private List<HariciSifreDTO> hariciSifreListesi;
    private Kullanici kullanici;
    private String url;

    public List<HariciSifreDTO> getHariciSifreListesi() {
        return hariciSifreListesi;
    }

    public void setHariciSifreListesi(List<HariciSifreDTO> hariciSifreListesi) {
        this.hariciSifreListesi = hariciSifreListesi;
    }

    public Kullanici getKullanici() {
        return kullanici;
    }

    public void setKullanici(Kullanici kullanici) {
        this.kullanici = kullanici;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
