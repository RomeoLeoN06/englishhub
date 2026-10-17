<div align="center">

# 🌐 EnglishHub

**100.000 Kelimelik Devasa İngilizce Öğrenme & İnteraktif Quiz Platformu**

[![React](https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-7.18-ca4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Words](https://img.shields.io/badge/Total_Words-100%2C000-10b981?style=for-the-badge)](#)
[![CEFR](https://img.shields.io/badge/CEFR_Levels-A1_to_C2-8b5cf6?style=for-the-badge)](#)

<p align="center">
  Görsellerle desteklenmiş zengin kelime kartları, çift yönlü flashcardlar, akıllı kategori gezgini, sesli telaffuz ve süreli quiz sistemiyle İngilizce öğrenmenin en eğlenceli ve modern yolu.
</p>

</div>

---

## 🚀 Özellikler (Features)

### 📚 1. 100.000 Kelimelik Kapsamlı Sözlük & Veri Tabanı
- **16 Uzmanlık Alanı:** Günlük Hayat, Mühendislik, Bilişim & Yazılım, Bilim & Araştırma, Hukuk, Tıp & Sağlık, İş & Ekonomi, Psikoloji, Eğitim, Sanat, Hayvanlar, Seyahat ve daha fazlası.
- **6 CEFR Seviyesi:** A1 (Başlangıç) seviyesinden C2 (Uzman / Mastery) seviyesine kadar her kelime için doğru zorluk derecelendirmesi.
- **Örnek Cümleler & Emojiler:** Her kelime için bağlamı pekiştiren akılda kalıcı örnek cümleler ve ikonik emojiler.

### 🃏 2. İnteraktif Flashcard & Öğrenme Modu
- **3 Farklı Çalışma Yönü:**
  - 🇬🇧 ➔ 🇹🇷 *İngilizce'den Türkçe'ye*
  - 🇹🇷 ➔ 🇬🇧 *Türkçe'den İngilizce'ye*
  - 🔀 *Karışık Mod*
- **Sesli Telaffuz (Web Speech API):** Doğal İngilizce aksanıyla kelimelerin sesli telaffuzunu anında dinleme imkanı.
- **Klavye Kısayolları ile Hızlı Çalışma:**
  - `Boşluk (Space)`: Kartı çevir
  - `Sağ / Sol Ok`: Sonraki / Önceki kart
  - `Yukarı Ok`: "Biliyorum" olarak işaretle
  - `Aşağı Ok`: "Tekrar Et" olarak işaretle

### 🧠 3. Çoktan Seçmeli Quiz Sistemi
- **Özelleştirilebilir Soru Sayısı & Süre:** 10, 20 veya 30 soruluk testler; soru başına 10s, 15s veya limitsiz süre seçenekleri.
- **Canlı Geri Bildirim:** Anında doğru/yanlış kontrolleri, kalan süre nabız göstergesi ve puanlama sistemi.
- **Hata Analiz Raporu:** Test bitiminde yanlış cevaplanan kelimeleri, doğru Türkçe karşılıklarını ve örnek cümlelerini listeleyen detaylı performans özeti.

### 📂 4. Akıllı Kategori Gezgini (Smart Category Modal)
- **Ekranla Bütünleşik Gezgin:** Sayfa düzenini bozmadan, üst menüden veya doğrudan <kbd>K</kbd> tuşuyla açılan tam ekran uyumlu modern modal penceresi.
- **Anlık Canlı Arama:** Kategori adı yazıldığında anında filtreleme.
- **Seviye ve Sıralama Filtreleri:** A1'den C2'ye seviye bazlı filtreleme ve kelime sayısına göre sıralama.

### 🎨 5. Modern Glassmorphism & Neon Dark UI
- Gözü yormayan modern karanlık tema (Dark Mode).
- Akıcı CSS geçişleri, mikro animasyonlar ve Canvas tabanlı arka plan partikül efektleri.
- Masaüstü, tablet ve mobil cihazlarla tam uyumlu (Fully Responsive).

---

## 🛠️ Teknolojiler (Tech Stack)

| Teknoloji | Açıklama |
|---|---|
| **React 19** | Modern bileşen mimarisi ve state yönetimi |
| **Vite 8** | Yüksek performanslı derleyici ve dev server |
| **React Router 7** | İstemci tarafı dinamik sayfa yönlendirmesi |
| **Vanilla CSS** | Sıfır harici CSS bağımlılığı, özel Glassmorphism ve CSS Değişkenleri |
| **HTML5 SpeechSynthesis** | Tarayıcı tabanlı yüksek kaliteli sesli telaffuz motoru |

---

## 📦 Kurulum ve Çalıştırma (Getting Started)

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/RomeoLeoN06/englishhub.git
cd englishhub
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```
Uygulama varsayılan olarak `http://localhost:3200` veya `http://localhost:5173` adresinde çalışacaktır.

### 4. Canlı (Production) Sürümü Derleyin
```bash
npm run build
```

---

## 📁 Proje Yapısı (Directory Structure)

```
englishhub/
├── public/                 # Statik varlıklar ve SVG ikonlar
├── src/
│   ├── assets/             # Görseller ve medya
│   ├── components/         # Yeniden kullanılabilir React bileşenleri
│   │   ├── CategoryExplorerModal.jsx  # Akıllı kategori arama modalı
│   │   ├── FilterModals.jsx           # Filtreleme pencereleri
│   │   ├── Navbar.jsx                 # Üst menü navigasyonu
│   │   └── Particles.jsx              # Arka plan partikül efekti
│   ├── context/            # React Context (CategoryModalContext, useCategoryModal)
│   ├── data/
│   │   ├── words.js        # Kategori & seviye metaverileri
│   │   └── wordsData.json  # 100.000 kelimelik veri tabanı
│   ├── pages/              # Sayfa bileşenleri
│   │   ├── HomePage.jsx    # Ana sayfa
│   │   ├── LearnPage.jsx   # Flashcard & kelime öğrenme sayfası
│   │   └── QuizPage.jsx    # İnteraktif quiz sayfası
│   ├── App.jsx             # Ana layout ve route tanımları
│   ├── index.css           # Global stil ve tasarım sistemi
│   └── main.jsx            # Uygulama başlangıç noktası
├── package.json
└── vite.config.js
```

---

## 📄 Lisans (License)

Bu proje MIT lisansı altında lisanslanmıştır. Dilediğiniz gibi kullanabilir, geliştirebilir ve katkıda bulunabilirsiniz.
