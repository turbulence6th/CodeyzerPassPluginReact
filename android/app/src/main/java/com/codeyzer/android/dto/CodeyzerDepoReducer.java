package com.codeyzer.android.dto;

import java.util.List;

public class CodeyzerDepoReducer {

    private List<HariciSifreDTO> hariciSifreListesi;
    private Kullanici kullanici;

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
}
