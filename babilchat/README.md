# Babil Chat - Günlük İbadet ve Manevi Rehberlik Uygulaması

> 🙏 **iOS için geliştirilmiş modern, AI destekli manevi rehberlik uygulaması**

[![React Native](https://img.shields.io/badge/React%20Native-0.74-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51.0-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![iOS](https://img.shields.io/badge/iOS-16.0+-blue.svg)](https://developer.apple.com/)

## 📱 Uygulama Özeti

Babil Chat, kullanıcıların manevi gelişimlerini desteklemek için tasarlanmış kapsamlı bir mobil uygulamadır. AI destekli sohbet, günlük ibadetler, dua duvarı ve çok daha fazlası ile manevi yolculuğunuzu destekler.

### ✨ Ana Özellikler

#### 🤖 **AI Destekli Manevi Rehberlik**
- Kişiselleştirilmiş manevi sohbet
- Çok dilli destek (Türkçe, İngilizce, Arapça)
- Yaşam sorularına İslami perspektiften cevaplar
- "Hz. Muhammed ne yapardı?" danışmanlığı

#### 📖 **Günlük İbadet Programları**
- Günlük ayet ve hadisler
- Kişiselleştirilmiş dua programları
- İbadet takip sistemi
- Günlük motivasyon mesajları

#### 🕌 **Dua ve Topluluk**
- Canlı dua duvarı
- Topluluk ile dua paylaşımı
- Arkadaş sistemi ve gruplar
- Karşılıklı dua desteği

#### 📚 **Çalışma Araçları**
- Kur'an çalışma planları
- Hadis koleksiyonları
- İslami karakter profilleri
- Bilgi yarışmaları

#### 🎨 **Premium Tasarım**
- iOS 18 uyumlu gradient tasarım
- Siyah-gri premium arka planlar
- Responsive kart tasarımları
- Akıcı sayfa geçiş animasyonları

## 🏗️ Uygulama Mimarisi

### 📄 **Sayfa Yapısı**

```
📱 Babil Chat
├── 🏠 Ana Sayfa (Home)
│   ├── Günlük Ayet Widget'ı
│   ├── Dua Zamanları
│   ├── Manevi Durum Takibi
│   └── Hızlı Erişim Menüsü
│
├── 💬 AI Chat
│   ├── Manevi Sohbet
│   ├── Soru-Cevap
│   ├── Yaşam Danışmanlığı
│   └── Hadis/Ayet Açıklamaları
│
├── 📖 Günlük İbadet
│   ├── Günün Ayeti
│   ├── Günün Hadisi
│   ├── Sabah/Akşam Duaları
│   └── Kişisel İbadet Planı
│
├── 🕌 Dua Duvarı
│   ├── Canlı Dua İstekleri
│   ├── Topluluk Duaları
│   ├── Dua Geçmişi
│   └── Dua Kategorileri
│
├── 📚 Çalışma Merkezi
│   ├── Kur'an Çalışması
│   ├── Hadis Koleksiyonu
│   ├── İslami Konular
│   └── Bilgi Yarışması
│
├── 👥 Topluluk
│   ├── Arkadaş Listesi
│   ├── Çalışma Grupları
│   ├── Paylaşımlar
│   └── Etkinlikler
│
├── ⚙️ Ayarlar
│   ├── Profil Yönetimi
│   ├── Bildirim Ayarları
│   ├── Dil Seçenekleri
│   └── Premium Üyelik
│
└── 💎 Premium Özellikler
    ├── Sınırsız AI Sohbet
    ├── Özel Widget Tasarımları
    ├── Gelişmiş Çalışma Planları
    └── Reklamsız Deneyim
```

### 🎨 **Tasarım Sistemi**

#### **Renk Paleti**
```typescript
const colors = {
  gradients: {
    primary: ['#1a1a1a', '#2d2d2d', '#404040'],
    secondary: ['#0f172a', '#1e293b', '#334155'],
    accent: ['#059669', '#10b981', '#34d399'],
    prayer: ['#7c3aed', '#8b5cf6', '#a78bfa'],
  },
  text: {
    primary: '#ffffff',
    secondary: '#e2e8f0',
    muted: '#94a3b8',
  }
}
```

#### **Tipografi**
```typescript
const typography = {
  fontFamily: {
    primary: 'SF Pro Display',
    arabic: 'Geeza Pro',
    body: 'SF Pro Text',
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
  }
}
```

## 🚀 Kurulum ve Geliştirme

### **Gereksinimler**
- Node.js 18+
- Expo CLI 49+
- iOS Simulator (Xcode 15+)
- TypeScript 5.0+

### **Proje Kurulumu**
```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npx expo start

# iOS simülatöründe çalıştır
npx expo run:ios

# Testleri çalıştır
npm test

# Build al
npx expo build:ios
```

### **Geliştirme Komutları**
```bash
# Kod kontrolü
npm run lint
npm run type-check

# Test komutları
npm run test
npm run test:watch
npm run test:coverage

# Build komutları
npm run build
npm run build:production
```

## 🧪 Test Stratejisi

### **Test Türleri**
- **Unit Tests**: Jest + React Native Testing Library
- **Integration Tests**: Detox
- **E2E Tests**: Maestro
- **Performance Tests**: Flipper

### **Test Dosya Yapısı**
```
__tests__/
├── components/
├── screens/
├── services/
├── utils/
└── e2e/
```

## 📦 Teknoloji Stack'i

### **Core Technologies**
- **React Native 0.74**: Mobil uygulama framework'ü
- **Expo 51**: Geliştirme ve deployment platformu
- **TypeScript 5.0**: Tip güvenli geliştirme
- **React Navigation 7**: Navigasyon yönetimi

### **State Management**
- **React Context + Reducer**: Global state yönetimi
- **React Query**: API veri yönetimi
- **Zustand**: Lightweight state management

### **UI & Styling**
- **NativeWind**: Tailwind CSS for React Native
- **React Native Reanimated 3**: Performanslı animasyonlar
- **React Native Gesture Handler**: Touch etkileşimleri
- **React Native Safe Area Context**: Safe area yönetimi

### **Data & Backend**
- **Supabase**: Backend as a Service
- **OpenAI API**: AI chat functionality
- **Firebase**: Push notifications
- **AsyncStorage**: Local data storage

### **Development Tools**
- **ESLint + Prettier**: Kod kalitesi
- **Husky**: Git hooks
- **Jest**: Unit testing
- **Detox**: E2E testing

## 📈 Performans Optimizasyonları

### **React Native Optimizasyonları**
- Lazy loading ile kod splitting
- Image optimizasyonu (WebP format)
- FlatList optimizasyonları
- useCallback ve useMemo kullanımı
- Bundle size optimizasyonu

### **UX Optimizasyonları**
- Skeleton loading screens
- Optimistic updates
- Offline-first architecture
- Progressive image loading

## 🔒 Güvenlik

### **Veri Güvenliği**
- End-to-end encryption
- Secure storage (Keychain/Keystore)
- API key rotation
- Input sanitization

### **Privacy**
- GDPR compliance
- Minimal data collection
- User consent management
- Data anonymization

## 🌍 Uluslararasılaştırma

### **Desteklenen Diller**
- 🇹🇷 Türkçe (Ana dil)
- 🇺🇸 İngilizce
- 🇸🇦 Arapça
- 🇩🇪 Almanca
- 🇫🇷 Fransızca

### **RTL Desteği**
- Arapça için RTL layout
- Responsive text scaling
- Kültürel içerik uyarlaması

## 💰 Monetizasyon Stratejisi

### **Freemium Model**
```typescript
const pricingTiers = {
  free: {
    aiChats: 10,
    dailyVerses: true,
    basicPrayers: true,
    ads: true,
  },
  premium: {
    weekly: 4.99,
    monthly: 12.99,
    yearly: 59.99,
    lifetime: 99.99,
    features: {
      unlimitedChats: true,
      premiumWidgets: true,
      adFree: true,
      exclusiveContent: true,
    }
  }
}
```

## 📊 Analytics ve Monitoring

### **Kullanıcı Takibi**
- Screen navigation tracking
- Feature usage analytics
- Crash reporting (Sentry)
- Performance monitoring

### **Business Metrics**
- Daily/Monthly Active Users
- Retention rates
- Conversion rates
- Revenue tracking

## 🚀 Deployment Pipeline

### **CI/CD Workflow**
```yaml
stages:
  - Code Quality Check
  - Unit Tests
  - Integration Tests
  - Build App
  - Deploy to TestFlight
  - App Store Review
  - Production Release
```

### **Release Strategy**
- **Alpha**: Internal testing
- **Beta**: TestFlight public beta
- **Production**: App Store release
- **Hotfix**: Critical bug fixes

## 🤝 Katkıda Bulunma

### **Geliştirme Süreçleri**
1. Feature branch oluştur
2. Kod geliştir ve test et
3. Pull request aç
4. Code review süreci
5. Merge ve deploy

### **Kod Standartları**
- ESLint rules compliance
- TypeScript strict mode
- Comprehensive test coverage
- Documentation requirements

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Email**: support@babilchat.com
- **Website**: https://babilchat.com
- **Twitter**: @babilchat

---

**Babil Chat ile manevi yolculuğunuzu güçlendirin! 🌙✨**
