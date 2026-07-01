# Font Dosyaları

Bu klasör Babil Chat uygulaması için gerekli font dosyalarını içerir.

## Gerekli Font Dosyaları

### Arapça Fontlar
- **Amiri-Regular.ttf** - Ana Arapça font
- **Amiri-Bold.ttf** - Kalın Arapça font

**İndirme Linki**: [Amiri Font](https://fonts.google.com/specimen/Amiri)

### Türkçe/İngilizce Fontlar  
- **Inter-Regular.ttf** - Ana font
- **Inter-Medium.ttf** - Orta kalınlık
- **Inter-SemiBold.ttf** - Yarı kalın
- **Inter-Bold.ttf** - Kalın font

**İndirme Linki**: [Inter Font](https://fonts.google.com/specimen/Inter)

## Kurulum

1. Yukarıdaki linklerden fontları indirin
2. Bu klasöre (`assets/fonts/`) font dosyalarını ekleyin
3. Dosya isimlerinin app.json'daki isimlerle eşleştiğinden emin olun

## Font Özellikleri

### Amiri
- Arapça metinler için optimize edilmiş
- Naskh stili
- Unicode 14.0 desteği
- RTL (sağdan sola) yazım desteği

### Inter
- Modern, okunabilir
- Çok dilli destek
- Web ve mobil için optimize
- Variable font desteği

## Kullanım

Fontlar `src/utils/typography.ts` dosyasında tanımlanır ve uygulamada `fontFamily` prop'u ile kullanılır:

```typescript
// Arapça metin için
<Text style={{ fontFamily: 'Amiri-Regular' }}>النص العربي</Text>

// Türkçe/İngilizce metin için  
<Text style={{ fontFamily: 'Inter-Regular' }}>Turkish/English text</Text>
``` 