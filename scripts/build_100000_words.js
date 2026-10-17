import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORDS_PATH = path.join(__dirname, '../src/data/wordsData.json');
const DICT_PATH = path.join(__dirname, 'dict_data/dictionary.json');

const TARGET_TOTAL = 100000;

// Category target allocations for balanced distribution
const TARGET_QUOTAS = {
  engineering: 12000,
  health: 11000,
  science: 10000,
  business: 9000,
  tech: 8000,
  law: 8000,
  animals: 6000,
  nature: 6000,
  education: 5000,
  psychology: 4000,
  colors: 3500,
  food: 3500,
  travel: 2000,
  professions: 2000,
  emotions: 1500,
  daily: 8500 // Will fill any remainder up to 100,000
};

// Keyword to Emoji dictionary
const emojiMap = {
  dog: '🐶', cat: '🐱', bird: '🐦', fish: '🐟', horse: '🐴', cow: '🐄', sheep: '🐑',
  lion: '🦁', tiger: '🐯', bear: '🐻', wolf: '🐺', fox: '🦊', deer: '🦌', monkey: '🐒',
  snake: '🐍', frog: '🐸', turtle: '🐢', insect: '🐛', butterfly: '🦋', bee: '🐝',
  apple: '🍎', banana: '🍌', bread: '🍞', cheese: '🧀', meat: '🥩', pizza: '🍕',
  rice: '🍚', coffee: '☕', tea: '🍵', milk: '🥛', water: '💧', beer: '🍺', wine: '🍷',
  tree: '🌲', flower: '🌸', mountain: '⛰️', river: '🌊', sun: '☀️', moon: '🌙', star: '⭐',
  car: '🚗', plane: '✈️', boat: '🚢', train: '🚆', bus: '🚌', bike: '🚲', rocket: '🚀',
  house: '🏠', door: '🚪', window: '🪟', bed: '🛏️', chair: '🪑', table: '🪑', book: '📖',
  computer: '💻', phone: '📱', camera: '📷', clock: '⏰', bell: '🔔', key: '🔑',
  doctor: '👨‍⚕️', nurse: '👩‍⚕️', teacher: '👩‍🏫', student: '🧑‍🎓', engineer: '👷', lawyer: '⚖️',
  money: '💰', bank: '🏦', card: '💳', price: '🏷️', heart: '❤️', brain: '🧠', eye: '👁️',
  music: '🎵', song: '🎶', dance: '💃', game: '🎮', sport: '⚽', fire: '🔥', ice: '🧊'
};

const categoryEmojis = {
  daily: ['🏠', '🚪', '🔑', '⏰', '📱', '📖', '🪑', '🛋️', '🪞', '☂️', '📦', '💡', '🔔', '📅', '🧼', '🧺', '🪟', '🧳', '🚶', '🤝', '☕'],
  food: ['🍕', '🍎', '🍞', '🧀', '🍗', '🥗', '🍲', '🍰', '☕', '🥤', '🍓', '🥕', '🥩', '🍔', '🥞', '🍣', '🥟', '🍇', '🍉', '🍯'],
  animals: ['🐾', '🐶', '🐱', '🦁', '🐯', '🐘', '🐎', '🦊', '🐻', '🐼', '🦅', '🦉', '🐬', '🐋', '🐢', '🦋', '🐝', '🦌', '🐰', '🦒'],
  colors: ['🎨', '🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '⚪', '⚫', '🟤', '🩷', '✨', '🌈', '💎', '🩶', '🌟', '🔆', '🖍️', '🖌️'],
  professions: ['💼', '👩‍🏫', '👨‍⚕️', '👮', '👷', '👨‍🍳', '⚖️', '✈️', '🎨', '🔬', '💻', '🧑‍🌾', '✍️', '🎭', '🧑‍💼', '🛠️', '🧭', '🏢'],
  emotions: ['💝', '😊', '😢', '😠', '😍', '🤩', '😎', '🥹', '😴', '😌', '🤔', '🥳', '🥰', '🤗', '💖', '✨', '🕊️', '🧘', '🌟'],
  travel: ['✈️', '🚆', '🚢', '🚗', '🗺️', '🏨', '🧳', '🏖️', '🗽', '🏔️', '🌉', '🚌', '🗼', '🧭', '🎫', '🏝️', '🛣️', '🛫'],
  tech: ['💻', '📱', '🌐', '🤖', '🛰️', '📡', '🔋', '⚙️', '📊', '🕹️', '💾', '🔌', '🔬', '💡', '⌨️', '🖥️', '🚀', '🧠'],
  nature: ['🌲', '🌸', '🌊', '☀️', '🌙', '⭐', '🌈', '⛰️', '🍃', '🔥', '❄️', '🌧️', '🌍', '🪴', '🌾', '🌋', '🌪️', '🌅'],
  health: ['🏥', '💊', '❤️', '🧠', '💪', '🩺', '🩹', '🩸', '👁️', '🦷', '🏃', '🧘', '🍎', '🧴', '🧬', '🌡️', '💉', '🥗', '🫀', '🫁'],
  education: ['🎓', '📚', '✏️', '🏫', '📝', '📖', '📜', '🎒', '🔬', '🗣️', '🅰️', '🧠', '💡', '🖊️', '📐', '🏛️', '🎯', '🧩'],
  business: ['📊', '💰', '💵', '💳', '🏢', '📈', '🤝', '💼', '🏦', '🏷️', '🛒', '🛍️', '📑', '🧾', '🪙', '💎', '👔', '📉'],
  engineering: ['⚙️', '🔧', '🔨', '🛠️', '🔩', '🪛', '📐', '🏗️', '🏭', '🚇', '🛰️', '🛢️', '⚡', '🧰', '🔋', '🔌'],
  science: ['🔬', '🧪', '⚗️', '🔭', '🧬', '🧲', '⚛️', '🪐', '🌠', '📐', '📊', '🧮', '🌌', '💡'],
  law: ['⚖️', '🏛️', '📜', '👮', '🛡️', '🗳️', '🖋️', '📑', '🪪', '💼', '🏛️'],
  psychology: ['🧠', '💭', '🧘', '👁️‍🗨️', '💡', '🎭', '🔮', '🕊️', '✨', '🤔']
};

function getEmoji(en, category, index) {
  const enLower = en.toLowerCase().replace(/[^a-z]/g, '');
  if (emojiMap[enLower]) return emojiMap[enLower];
  for (const [key, icon] of Object.entries(emojiMap)) {
    if (key.length >= 4 && enLower.includes(key)) {
      return icon;
    }
  }
  const catList = categoryEmojis[category] || categoryEmojis.daily;
  return catList[index % catList.length];
}

function mapCategory(rawCat, type, en, tr) {
  const c = (rawCat || '').toLowerCase();
  const trLower = (tr || '').toLowerCase();
  const enLower = (en || '').toLowerCase();

  // 1. Keyword check for professions
  if (/(\buzmanı\b|\bdoktoru\b|\bmühendisi\b|\byazarı\b|\bteknisyeni\b|\boperatörü\b|\böğretmeni\b|\byöneticisi\b|\bavukatı\b|\bmemuru\b|\bişçisi\b|\bustası\b|\bmüdürü\b|\btemsilcisi\b|\bprofesörü\b|\başçısı\b|\bressamı\b)/i.test(trLower)) {
    return 'professions';
  }
  // 2. Keyword check for emotions
  if (/\b(mutluluk|üzüntü|öfke|nefret|sevgi|korku|endişe|huzur|sevinç|coşku|keder|acı|kaygı|gurur|utanç|kıskançlık|keder|sevinçli|üzgün|kızgın|öfkeli|huzurlu|kaygılı|neşeli|hırslı)\b/i.test(trLower)) {
    return 'emotions';
  }
  // 3. Keyword check for colors
  if (/\b(renk|kırmızı|mavi|yeşil|sarı|mor|turuncu|pembe|kahverengi|gri|beyaz|siyah|ton|boya|pigment|tonlama|açık mavi|koyu yeşil)\b/i.test(trLower)) {
    return 'colors';
  }
  // 4. Keyword check for food
  if (/\b(yemek|meyve|sebze|tatlı|çorba|ekmek|içecek|et|peynir|balık|pişir|lezzet|mutfak|tat|sos|şarap|bira|kek|pasta|salata|makarna|börek|kahve|çay|süt)\b/i.test(trLower)) {
    return 'food';
  }
  // 5. Keyword check for animals
  if (/\b(hayvan|kuş|balık|böcek|kedi|köpek|at|ayı|aslan|kaplan|kartal|yılan|memeli|sürüngen|tür|avcı|balina|yunus|ördek|tavuk|kurt|tilki|geyik|maymun|fil|kaplumbağa)\b/i.test(trLower)) {
    return 'animals';
  }

  // 6. Direct category mapping based on raw dataset category
  if (/computer|telecom|informatic|internet|software|hardware|cyber|network|data|digital|television|media|printery/.test(c)) return 'tech';
  if (/technical|construct|automotive|aeronautic|marine|electric|mechanic|nuclear|industrial|metallurg|mining|robot|architect|woodworking|lighting|textile|railway/.test(c)) return 'engineering';
  if (/chem|physic|math|statistic|biolog|astronom|geolog|geometr|scienc|optic|genetic|meteorolog|oceanograph|archaeol/.test(c)) return 'science';
  if (/medic|patholog|pharmaceut|anatom|physiolog|dentist|health|psychiatr|surger|veterinar|cardio|dermato|ophthalmo|gyneco|parasitolog/.test(c)) return 'health';
  if (/law|politic|militar|diploma|govern|legal|justic|police|constitut|criminol|institute/.test(c)) return 'law';
  if (/trade|econom|commerc|financ|bank|market|business|account|insur|manage|real estate|corporat|advertis/.test(c)) return 'business';
  if (/psychol|philosop|sociol|logic|ethic|behavior|social sciences/.test(c)) return 'psychology';
  if (/educat|academ|universit|linguist|literat|school|teach|librar|grammar|research|history|latin|mytholog/.test(c)) return 'education';
  if (/gastronom|culinar|beverag|cook|nutrit|food engineering|brewery|tobacco/.test(c)) return 'food';
  if (/zoolog|animal|ornitholog|entomolog|fauna|wildlife|marine biology|breeding|fishery|apiculture|reptile|hunting/.test(c)) return 'animals';
  if (/botan|forest|ecolog|nature|environ|earth|agricult|plant|flora|geography/.test(c)) return 'nature';
  if (/travel|tourism|aviat|nautic|navigat|hotel|transport|traffic/.test(c)) return 'travel';
  if (/profess|occupat|career|job/.test(c)) return 'professions';
  if (/color|art|design|paint|dye|fashion|cinema|theatre|photography|music/.test(c)) return 'colors';

  return 'daily';
}

function assignLevel(category, en, type) {
  const len = en.length;
  if (['daily', 'food', 'colors', 'animals'].includes(category)) {
    if (len <= 5) return 'A1';
    if (len <= 7) return 'A2';
    if (len <= 9) return 'B1';
    return 'B2';
  }
  if (['travel', 'professions', 'emotions', 'nature'].includes(category)) {
    if (len <= 6) return 'A2';
    if (len <= 8) return 'B1';
    if (len <= 10) return 'B2';
    return 'C1';
  }
  if (['tech', 'business', 'education', 'psychology'].includes(category)) {
    if (len <= 6) return 'B1';
    if (len <= 9) return 'B2';
    if (len <= 11) return 'C1';
    return 'C2';
  }
  // engineering, science, health, law
  if (len <= 6) return 'B2';
  if (len <= 9) return 'C1';
  return 'C2';
}

const exampleTemplates = {
  v: [
    (w) => `They decided to ${w} before finalizing the project.`,
    (w) => `You need to ${w} carefully to achieve the desired outcome.`,
    (w) => `Experts recommend to ${w} during the initial phase.`,
    (w) => `The team was instructed to ${w} according to protocol.`,
    (w) => `We must ${w} to ensure maximum efficiency.`,
    (w) => `It is important to ${w} when evaluating the situation.`
  ],
  adj: [
    (w) => `The report highlighted several ${w} aspects of the development.`,
    (w) => `This approach provides a ${w} solution to common challenges.`,
    (w) => `Researchers observed a ${w} pattern throughout the investigation.`,
    (w) => `Maintaining a ${w} standard is crucial for long-term success.`,
    (w) => `The analysis demonstrated ${w} improvements in overall performance.`,
    (w) => `They adopted a ${w} methodology for greater reliability.`
  ],
  adv: [
    (w) => `The system operates ${w} under standard operating conditions.`,
    (w) => `The committee reviewed the findings ${w} before making a decision.`,
    (w) => `The process was executed ${w} to avoid discrepancies.`,
    (w) => `They responded ${w} to the new requirements.`
  ],
  health: [
    (w) => `Clinical studies investigated the diagnostic value of ${w}.`,
    (w) => `Medical practitioners carefully monitor changes related to ${w}.`,
    (w) => `Proper management of ${w} plays a vital role in patient care.`,
    (w) => `Healthcare professionals reviewed the latest guidelines on ${w}.`
  ],
  tech: [
    (w) => `The software implements an optimized ${w} for enhanced performance.`,
    (w) => `Engineers deployed an innovative ${w} in the cloud infrastructure.`,
    (w) => `Modern computing systems rely heavily on robust ${w}.`,
    (w) => `The development team integrated ${w} into the core framework.`
  ],
  engineering: [
    (w) => `The engineering design incorporates advanced ${w} specifications.`,
    (w) => `Technicians conducted rigorous stress tests on the ${w}.`,
    (w) => `Modern manufacturing processes require precise calibration of ${w}.`,
    (w) => `The industrial facility upgraded its ${w} systems.`
  ],
  science: [
    (w) => `Scientific experiments confirmed the fundamental properties of ${w}.`,
    (w) => `The research paper discusses novel discoveries regarding ${w}.`,
    (w) => `Laboratory observations revealed key data concerning ${w}.`,
    (w) => `Scientists formulated a new hypothesis explaining ${w}.`
  ],
  law: [
    (w) => `The judicial panel examined key precedents regarding ${w}.`,
    (w) => `Legal statutes define the formal obligations concerning ${w}.`,
    (w) => `The regulatory commission introduced new policies on ${w}.`,
    (w) => `Attorneys presented compelling arguments relating to ${w}.`
  ],
  business: [
    (w) => `Market analysts closely evaluate economic trends in ${w}.`,
    (w) => `The enterprise updated its strategic roadmap concerning ${w}.`,
    (w) => `Strategic investment in ${w} generated substantial returns.`,
    (w) => `Corporate executives held a summit to discuss ${w}.`
  ],
  psychology: [
    (w) => `Psychological assessments evaluate the behavioral impact of ${w}.`,
    (w) => `Cognitive research examines mental processes associated with ${w}.`,
    (w) => `Therapeutic interventions focus on understanding ${w}.`
  ],
  education: [
    (w) => `The academic curriculum emphasizes deep understanding of ${w}.`,
    (w) => `Scholars published extensive literature reviewing ${w}.`,
    (w) => `The university seminar explored theoretical foundations of ${w}.`
  ],
  nature: [
    (w) => `Environmental conservation protects natural habitats from losing ${w}.`,
    (w) => `Ecologists documented the ecological role of ${w} in the biome.`,
    (w) => `Field researchers observed seasonal variations in ${w}.`
  ],
  animals: [
    (w) => `Zoological research documented the unique behavior of ${w}.`,
    (w) => `Wildlife protection programs aim to preserve ${w} in their native habitat.`,
    (w) => `Biologists studied the adaptation mechanisms of ${w}.`
  ],
  food: [
    (w) => `Culinary experts appreciate the rich flavor profile of ${w}.`,
    (w) => `Traditional recipes often feature ${w} as a key ingredient.`,
    (w) => `Nutritional guidelines highlight the dietary benefits of ${w}.`
  ],
  travel: [
    (w) => `Travelers enjoyed exploring famous locations known for ${w}.`,
    (w) => `International itineraries include memorable experiences with ${w}.`,
    (w) => `The transport network provides convenient access to ${w}.`
  ],
  professions: [
    (w) => `A qualified ${w} possesses specialized skills and extensive training.`,
    (w) => `The career path of a ${w} requires dedication and ongoing learning.`,
    (w) => `Industry leaders seek talented individuals to work as ${w}.`
  ],
  emotions: [
    (w) => `She expressed genuine ${w} upon hearing the heartwarming news.`,
    (w) => `Recognizing and managing ${w} is essential for emotional well-being.`,
    (w) => `The profound sense of ${w} inspired creative expression.`
  ],
  colors: [
    (w) => `The artistic composition features vibrant shades of ${w}.`,
    (w) => `Designers selected ${w} to create an elegant aesthetic.`,
    (w) => `Visual artists skillfully blended tones of ${w}.`
  ],
  daily: [
    (w) => `We often encounter ${w} in our everyday routine.`,
    (w) => `Understanding ${w} helps improve daily communication skills.`,
    (w) => `She remarked on the significance of ${w} during the conversation.`,
    (w) => `Having a clear grasp of ${w} makes learning English much easier.`
  ]
};

function generateExample(en, type, category, idx) {
  const w = en.toLowerCase();
  let pool = exampleTemplates[type] || exampleTemplates[category] || exampleTemplates.daily;
  const tmpl = pool[idx % pool.length];
  return tmpl(w);
}

function cleanEn(str) {
  if (!str) return '';
  str = str.trim();
  return str.split(' ').map(w => {
    if (!w) return '';
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ');
}

function cleanTr(str) {
  if (!str) return '';
  str = str.replace(/\([^)]*\)/g, '').trim();
  str = str.replace(/["'`]/g, '').trim();
  if (str.includes(',')) {
    const parts = str.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length > 0 && parts[0].length >= 2) str = parts[0];
  }
  if (str.includes(';')) {
    const parts = str.split(';').map(s => s.trim()).filter(Boolean);
    if (parts.length > 0 && parts[0].length >= 2) str = parts[0];
  }
  str = str.trim();
  if (!str) return '';
  const first = str.charAt(0);
  let upperFirst = first.toUpperCase();
  if (first === 'i') upperFirst = 'İ';
  else if (first === 'ı') upperFirst = 'I';
  return upperFirst + str.slice(1);
}

async function run() {
  console.log('--- Building Balanced 100,000 Word Dataset ---');

  // 1. Load initial words
  const curr = JSON.parse(fs.readFileSync(WORDS_PATH, 'utf8'));
  const seedWords = curr.slice(0, 12629);
  const seenEn = new Set();
  const finalWords = [];

  for (const item of seedWords) {
    const lower = item.en.trim().toLowerCase();
    if (!seenEn.has(lower)) {
      seenEn.add(lower);
      finalWords.push({
        id: finalWords.length + 1,
        en: cleanEn(item.en),
        tr: cleanTr(item.tr),
        emoji: item.emoji || '📖',
        level: item.level || 'B1',
        category: item.category || 'daily',
        example: item.example || `A clear example of ${item.en}.`
      });
    }
  }

  console.log(`Preserved ${finalWords.length} unique initial words.`);

  // 2. Stream entire dictionary.json and bucket by category
  console.log('Streaming full dictionary and bucketing candidates by category...');
  const categoryPools = {};
  for (const cat of Object.keys(TARGET_QUOTAS)) {
    categoryPools[cat] = [];
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(DICT_PATH),
    crlfDelay: Infinity
  });

  let rawExamined = 0;

  for await (const line of rl) {
    rawExamined++;
    let l = line.trim();
    if (l.startsWith('[')) l = l.substring(1).trim();
    if (l.endsWith(']')) l = l.substring(0, l.length - 1).trim();
    if (l.endsWith(',')) l = l.substring(0, l.length - 1).trim();
    if (!l) continue;

    try {
      const item = JSON.parse(l);
      let rawWord = (item.word || '').trim();
      let rawTr = (item.tr || '').trim();
      let cat = (item.category || '').trim();
      let type = (item.type || '').trim().toLowerCase().replace('.', '');
      if (!rawWord || !rawTr) continue;

      if (['Abbreviation', 'Acronym', 'Archaic', 'Prefix', 'Suffix', 'Geography', 'Places'].includes(cat)) continue;
      if (item.type === 'interj.') continue;
      if (rawWord.length > 1 && rawWord === rawWord.toUpperCase()) continue;

      if (!/^[a-zA-Z]+([ -][a-zA-Z]+)*$/.test(rawWord)) continue;
      if (rawWord.length < 3 || rawWord.length > 28) continue;

      if (rawTr.length < 2 || rawTr.length > 50) continue;
      if (/(erkek|kadın|bayan) ismi/i.test(rawTr)) continue;
      if (/bir (şehir|eyalet|kasaba|nehir|dağ|ilçe|köy|ülke|bölge|ada|göl|okyanus)/i.test(rawTr)) continue;
      if (rawTr.includes('...') || rawTr.includes('---')) continue;

      const lower = rawWord.toLowerCase();
      if (seenEn.has(lower)) continue;

      const cleanedEn = cleanEn(rawWord);
      const cleanedTr = cleanTr(rawTr);
      if (!cleanedTr || cleanedTr.length < 2) continue;

      const targetCategory = mapCategory(cat, type, cleanedEn, cleanedTr);
      if (!categoryPools[targetCategory]) categoryPools[targetCategory] = [];

      categoryPools[targetCategory].push({
        rawWord: cleanedEn,
        rawTr: cleanedTr,
        lower,
        cat,
        type,
        category: targetCategory
      });
    } catch(err) {}
  }

  console.log('Finished streaming dictionary! Pool sizes:');
  for (const [cat, items] of Object.entries(categoryPools)) {
    console.log(`  - ${cat}: ${items.length} candidates`);
  }

  // Count how many words each category already has from initial dataset
  const currentCatCounts = {};
  for (const w of finalWords) {
    currentCatCounts[w.category] = (currentCatCounts[w.category] || 0) + 1;
  }

  // 3. Take words from each category pool according to quotas
  console.log('\nSelecting words from category pools to meet quotas...');
  for (const [cat, target] of Object.entries(TARGET_QUOTAS)) {
    if (cat === 'daily') continue; // Fill daily last
    const current = currentCatCounts[cat] || 0;
    const need = Math.max(0, target - current);
    const pool = categoryPools[cat] || [];
    let added = 0;

    for (let i = 0; i < pool.length && added < need && finalWords.length < TARGET_TOTAL; i++) {
      const item = pool[i];
      if (seenEn.has(item.lower)) continue;
      seenEn.add(item.lower);

      const level = assignLevel(cat, item.rawWord, item.type);
      const emoji = getEmoji(item.rawWord, cat, finalWords.length);
      const example = generateExample(item.rawWord, item.type, cat, finalWords.length);

      finalWords.push({
        id: finalWords.length + 1,
        en: item.rawWord,
        tr: item.rawTr,
        emoji,
        level,
        category: cat,
        example
      });

      added++;
    }
    console.log(`  Category [${cat}]: reached ${current + added} words (+${added})`);
  }

  // 4. Fill remaining slots up to 100,000 using daily and any remaining candidates from other pools
  console.log(`\nCurrent total before final fill: ${finalWords.length}`);
  const remainingSlots = TARGET_TOTAL - finalWords.length;
  console.log(`Filling remaining ${remainingSlots} slots to reach exactly ${TARGET_TOTAL}...`);

  const fallbackPools = [categoryPools.daily, ...Object.values(categoryPools)];
  for (const pool of fallbackPools) {
    if (finalWords.length >= TARGET_TOTAL) break;
    for (let i = 0; i < pool.length && finalWords.length < TARGET_TOTAL; i++) {
      const item = pool[i];
      if (seenEn.has(item.lower)) continue;
      seenEn.add(item.lower);

      const cat = item.category || 'daily';
      const level = assignLevel(cat, item.rawWord, item.type);
      const emoji = getEmoji(item.rawWord, cat, finalWords.length);
      const example = generateExample(item.rawWord, item.type, cat, finalWords.length);

      finalWords.push({
        id: finalWords.length + 1,
        en: item.rawWord,
        tr: item.rawTr,
        emoji,
        level,
        category: cat,
        example
      });
    }
  }

  // 5. Final check
  console.log(`\nFinal total words: ${finalWords.length}`);
  if (finalWords.length !== TARGET_TOTAL) {
    console.warn(`Note: Target is ${TARGET_TOTAL}, current is ${finalWords.length}`);
  }

  // Re-index all IDs sequentially 1..100000
  for (let i = 0; i < finalWords.length; i++) {
    finalWords[i].id = i + 1;
  }

  const finalCatStats = {};
  const finalLvlStats = {};
  for (const w of finalWords) {
    finalCatStats[w.category] = (finalCatStats[w.category] || 0) + 1;
    finalLvlStats[w.level] = (finalLvlStats[w.level] || 0) + 1;
  }

  console.log('\n--- Final Category Distribution ---');
  console.log(finalCatStats);
  console.log('\n--- Final Level Distribution ---');
  console.log(finalLvlStats);

  // 6. Save wordsData.json
  console.log('\nWriting wordsData.json...');
  fs.writeFileSync(WORDS_PATH, JSON.stringify(finalWords), 'utf8');

  const stats = fs.statSync(WORDS_PATH);
  console.log(`SUCCESS! Saved wordsData.json with ${finalWords.length} words! File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

run().catch(console.error);
