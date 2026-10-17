// Kelime veritabanı (100.000 Kelime) - İngilizce, Türkçe, emoji, seviye, kategori, örnek cümle
import wordsData from './wordsData.json';

export const categories = [
  { id: "daily", name: "Günlük Hayat", nameEn: "Daily Life", icon: "🏠", color: "#6366f1", gradient: "linear-gradient(135deg, #6366f1, #818cf8)" },
  { id: "engineering", name: "Mühendislik & Teknik", nameEn: "Engineering & Tech", icon: "⚙️", color: "#f97316", gradient: "linear-gradient(135deg, #f97316, #fb923c)" },
  { id: "science", name: "Bilim & Araştırma", nameEn: "Science & Research", icon: "🔬", color: "#06b6d4", gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)" },
  { id: "tech", name: "Bilişim & Yazılım", nameEn: "Software & Tech", icon: "💻", color: "#3b82f6", gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)" },
  { id: "law", name: "Hukuk & Siyaset", nameEn: "Law & Politics", icon: "⚖️", color: "#64748b", gradient: "linear-gradient(135deg, #64748b, #94a3b8)" },
  { id: "psychology", name: "Psikoloji & Zihin", nameEn: "Psychology & Mind", icon: "🧠", color: "#a855f7", gradient: "linear-gradient(135deg, #a855f7, #c084fc)" },
  { id: "business", name: "İş & Ekonomi", nameEn: "Business & Economy", icon: "📊", color: "#d97706", gradient: "linear-gradient(135deg, #d97706, #fbbf24)" },
  { id: "health", name: "Sağlık & Tıp", nameEn: "Health & Medicine", icon: "🏥", color: "#e11d48", gradient: "linear-gradient(135deg, #e11d48, #fb7185)" },
  { id: "education", name: "Eğitim & Akademi", nameEn: "Education & Study", icon: "🎓", color: "#7c3aed", gradient: "linear-gradient(135deg, #7c3aed, #a855f7)" },
  { id: "food", name: "Yemek & İçecek", nameEn: "Food & Drink", icon: "🍕", color: "#f43f5e", gradient: "linear-gradient(135deg, #f43f5e, #fb7185)" },
  { id: "animals", name: "Hayvanlar", nameEn: "Animals", icon: "🐾", color: "#10b981", gradient: "linear-gradient(135deg, #10b981, #34d399)" },
  { id: "colors", name: "Renkler", nameEn: "Colors", icon: "🎨", color: "#f59e0b", gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)" },
  { id: "professions", name: "Meslekler", nameEn: "Professions", icon: "💼", color: "#8b5cf6", gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)" },
  { id: "emotions", name: "Duygular", nameEn: "Emotions", icon: "💝", color: "#ec4899", gradient: "linear-gradient(135deg, #ec4899, #f472b6)" },
  { id: "travel", name: "Seyahat & Ulaşım", nameEn: "Travel & Places", icon: "✈️", color: "#0ea5e9", gradient: "linear-gradient(135deg, #0ea5e9, #38bdf8)" },
  { id: "nature", name: "Doğa & Çevre", nameEn: "Nature & Environment", icon: "🌲", color: "#059669", gradient: "linear-gradient(135deg, #059669, #34d399)" },
];

export const levels = [
  { id: "A1", name: "Başlangıç", nameEn: "Beginner", color: "#10b981", icon: "🌱" },
  { id: "A2", name: "Temel", nameEn: "Elementary", color: "#3b82f6", icon: "📘" },
  { id: "B1", name: "Orta", nameEn: "Intermediate", color: "#f59e0b", icon: "⭐" },
  { id: "B2", name: "Üst Orta", nameEn: "Upper Intermediate", color: "#ef4444", icon: "🔥" },
  { id: "C1", name: "İleri Seviye", nameEn: "Advanced", color: "#8b5cf6", icon: "👑" },
  { id: "C2", name: "Uzman / Zorlu", nameEn: "Mastery", color: "#ec4899", icon: "⚡" },
];

export default wordsData;
