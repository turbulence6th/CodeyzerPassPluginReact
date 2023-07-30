package com.codeyzer.android.dto;

public class Cevap<T> {

    private T sonuc;
    private Boolean basarili;
    private String mesaj;

    public Cevap() {

    }

    public Cevap(T sonuc, String mesaj) {
        this(sonuc, true, mesaj);
    }

    public Cevap(T sonuc, Boolean basarili, String mesaj) {
        this.sonuc = sonuc;
        this.basarili = basarili;
        this.mesaj = mesaj;
    }

    public T getSonuc() {
        return sonuc;
    }

    public void setSonuc(T sonuc) {
        this.sonuc = sonuc;
    }

    public Boolean getBasarili() {
        return basarili;
    }

    public void setBasarili(Boolean basarili) {
        this.basarili = basarili;
    }

    public String getMesaj() {
        return mesaj;
    }

    public void setMesaj(String mesaj) {
        this.mesaj = mesaj;
    }
}