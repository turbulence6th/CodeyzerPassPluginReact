# Codeyzer Pass

Codeyzer Pass, hem Android hem de Chrome uzantısı olarak çalışan bir şifre yöneticisidir. React, Redux, TypeScript ve Capacitor teknolojileriyle geliştirilmiştir.

## 🚀 Özellikler

- 🔐 Şifre saklama ve yönetimi
- 🌐 Chrome uzantısı olarak kullanım
- 📱 Android mobil uygulama desteği (Capacitor ile)
- 🌍 Çoklu dil desteği (i18next)
- 📦 Durum yönetimi için Redux + Persist + State Sync
- 💾 Cihazda şifreli saklama (bcryptjs)
- ⚡ Modern ve hızlı kullanıcı arayüzü (PrimeReact + Bootstrap)

## 🛠 Kurulum

### Gerekli Araçlar

- Node.js (v16 veya üzeri)
- npm
- Android Studio (mobil geliştirme için)
- Chrome (uzantı testleri için)

### Kurulum Adımları

```bash
git clone https://github.com/kullanici/codeyzer-pass.git
cd codeyzer-pass
npm install
```

## 📦 Geliştirme Komutları

### Web için başlat

```bash
npm run start:web
```

### Chrome uzantısı için build

```bash
npm run build:chrome
```

### Android için build ve senkronizasyon

```bash
npm run build:android
npm run openAndroid
```

## 📁 Ortam Dosyaları

Her platform için `.env` dosyaları bulunmaktadır:

- `.env.web`
- `.env.chrome`
- `.env.android`

Bu dosyalar `env-cmd` ile otomatik olarak yüklenir.

## 📚 Kullanılan Teknolojiler

- React
- Redux / Redux Persist / Redux State Sync
- TypeScript
- Capacitor (Android entegrasyonu)
- PrimeReact / PrimeFlex / Bootstrap
- bcryptjs / validatorjs
- i18next

## ✅ Test

```bash
npm test
```

## 🧪 Çevreler

- `development`: Lokal geliştirme için
- `production`: Canlı ortam

## 👨‍💻 Geliştirici Notları

- Rate limiting backend tarafında yapılmalıdır.
- Şifreler asla düz metin olarak saklanmaz, bcrypt ile hash'lenir.
- Android senkronizasyonu için `npx cap sync` komutu gereklidir.

---

MIT License © Codeyzer
