# 🔥 Firebase Kurulum Rehberi

## 📋 Adım 1: Firebase CLI Kurulumu

```bash
# Firebase CLI'yi global olarak yükle
npm install -g firebase-tools

# Firebase'e giriş yap
firebase login

# Projenin olduğu klasörde
firebase init
```

## 📱 Adım 2: Firebase Projesi Oluştur

1. **Firebase Console'a git**: https://console.firebase.google.com/
2. **"Proje Ekle"** butonuna tıkla
3. **Proje adı**: `quran-hidayet-ai` (veya istediğin isim)
4. **Google Analytics**: Etkinleştir (önerilir)
5. **Proje oluştur** butonuna tıkla

## ⚙️ Adım 3: Firebase Servisleri Aktifleştir

### 🔐 Authentication
1. Sol menüden **"Authentication"** > **"Get started"**
2. **"Sign-in method"** sekmesine git
3. Şu yöntemleri aktifleştir:
   - ✅ **Email/Password**
   - ✅ **Anonymous** 
   - ✅ **Apple** (iOS için)
   - ✅ **Google** (opsiyonel)

### 🗄️ Firestore Database
1. Sol menüden **"Firestore Database"** > **"Create database"**
2. **"Start in test mode"** seç (şimdilik)
3. **Lokasyon**: `europe-west1` (en yakın)
4. **"Done"** butonuna tıkla

### 📢 Cloud Messaging
1. Sol menüden **"Cloud Messaging"** > **"Get started"**
2. Varsayılan ayarları kabul et

### 📊 Analytics
1. Sol menüden **"Analytics"** > **"Get started"**
2. Varsayılan ayarları kabul et

## 📲 Adım 4: React Native App Ekle

1. Firebase Console'da proje ayarlarına git (⚙️ ikonu)
2. **"Genel"** sekmesinde **"Uygulamalarınız"** bölümüne git
3. **"iOS"** ikonuna tıkla:
   - **iOS bundle ID**: `com.hidayet.ai`
   - **App nickname**: `Quran Hidayet AI iOS`
   - **App Store ID**: (şimdilik boş bırak)
4. **"Android"** ikonuna tıkla:
   - **Android package name**: `com.ercaap.quran.ai`
   - **App nickname**: `Quran Hidayet AI Android`
   - **Debug signing certificate**: (şimdilik boş)

## 🔑 Adım 5: Environment Variables Ayarla

Firebase ayarlarını `.env` dosyasına kopyala:

```bash
# .env dosyası oluştur
cp .env.example .env
```

`.env` dosyasını aç ve şu bilgileri Firebase Console'dan kopyala:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=REDACTED
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=quran-hidayet-ai.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=quran-hidayet-ai
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=quran-hidayet-ai.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=683673852626
EXPO_PUBLIC_FIREBASE_APP_ID=1:683673852626:web:175ad5072b3864f74e2b0b
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-EXJ90KLPLG
```

### 🔍 Firebase Ayarlarını Nerede Bulacaksın:

1. **Firebase Console** > **Proje Ayarları** (⚙️ ikonu)
2. **"Genel"** sekmesi > **"Web uygulamanız"** bölümü
3. **"Config"** radyo butonunu seç
4. Ayarları kopyala

## 📝 Adım 6: Firebase Rules Ayarla

### Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcılar sadece kendi verilerini okuyabilir/yazabilir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Dua talepleri herkese açık (okuma), sadece giriş yapmış kullanıcılar yazabilir
    match /duaRequests/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Günlük ayetler herkese açık
    match /dailyVerses/{document} {
      allow read: if true;
      allow write: if false; // Sadece admin
    }
  }
}
```

### Storage Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🔔 Adım 7: Push Notifications

### iOS için APNs Key:
1. **Apple Developer Console** > **Certificates, Identifiers & Profiles**
2. **Keys** > **Create a key**
3. **Apple Push Notifications service (APNs)** seç
4. Key'i indir ve Firebase'e yükle

### Android için:
1. Otomatik olarak FCM kullanılır
2. Ekstra ayar gerekmez

## 🧪 Adım 8: Test Et

```bash
# Uygulamayı çalıştır
npm start

# Test kullanıcısı oluştur
# Firebase Console > Authentication > Users > Add user
```

## 🚀 Adım 9: Production için Hazırla

### Security Rules (Production):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /duaRequests/{document} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### Analytics Events:
```typescript
// Önemli olayları takip et
logEvent('user_signup', { method: 'email' });
logEvent('dua_created', { category: 'health' });
logEvent('daily_verse_read', { surah: 'Al-Fatiha' });
```

## 📊 Firebase Console Özellikleri

### 🔍 Analytics Dashboard:
- Kullanıcı sayısı ve davranışları
- Uygulama kullanım istatistikleri
- Crash raporları

### 💬 Cloud Messaging:
- Push notification gönderme
- Kullanıcı segmentasyonu
- A/B testing

### ⚡ Performance Monitoring:
- Uygulama hızı takibi
- Crash monitoring
- Network istekleri

### 📱 Remote Config:
- Canlı ayar değişiklikleri
- Feature flag'ler
- A/B testing

## 🔧 Sorun Giderme

### ❌ "Firebase not initialized" hatası:
```typescript
// firebase.config.js dosyasını kontrol et
// .env dosyasındaki değişkenleri kontrol et
```

### ❌ Authentication hatası:
```bash
# Firebase Console > Authentication > Sign-in method
# Email/Password aktif olduğundan emin ol
```

### ❌ Push notification gelmiyorsa:
```bash
# iOS: APNs key yüklenmiş mi?
# Android: google-services.json dosyası var mı?
```

---

## 🎯 Hızlı Başlangıç (TL;DR)

```bash
# 1. Firebase CLI yükle
npm install -g firebase-tools

# 2. Login yap
firebase login

# 3. Console'dan proje oluştur: https://console.firebase.google.com/

# 4. .env dosyasını düzenle
cp .env.example .env

# 5. Firebase ayarlarını .env'e kopyala

# 6. Uygulamayı test et
npm start
```

**🔥 Firebase projen artık hazır!** 

Authentication, database, push notifications ve analytics tamamen aktif! 🎉 