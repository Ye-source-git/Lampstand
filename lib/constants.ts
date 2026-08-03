// ————— Palette & type (Lamplit reading-room) —————
// Values are CSS custom properties (defined for light/dark in app/globals.css) rather
// than literal hex, so every component that reads C.* is theme-aware automatically.
export const C = {
  paper: "var(--paper)",
  card: "var(--card)",
  ink: "var(--ink)",
  inkSoft: "var(--ink-soft)",
  gold: "var(--gold)",
  goldSoft: "var(--gold-soft)",
  deep: "var(--deep)",
  border: "var(--border)",
  white: "var(--surface)",
} as const;

export const HIGHLIGHTS: Record<string, string> = {
  gold: "var(--highlight-gold)",
  green: "var(--highlight-green)",
  rose: "var(--highlight-rose)",
};

// Fixed brand colors for contexts that must render consistently regardless of the
// viewer's theme (e.g. exported/shared verse images) — never swap these for C.*.
export const BRAND = {
  deep: "#2E4230",
  goldSoft: "#E9DFC8",
  white: "#FDFDFB",
  gold: "#A67C2E",
} as const;

export const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Lora:ital,wght@0,400;0,500;1,400&family=Albert+Sans:wght@400;500;600&display=swap";

// ————— All 66 books —————
export const OT: [string, number][] = [["Genesis",50],["Exodus",40],["Leviticus",27],["Numbers",36],["Deuteronomy",34],["Joshua",24],["Judges",21],["Ruth",4],["1 Samuel",31],["2 Samuel",24],["1 Kings",22],["2 Kings",25],["1 Chronicles",29],["2 Chronicles",36],["Ezra",10],["Nehemiah",13],["Esther",10],["Job",42],["Psalms",150],["Proverbs",31],["Ecclesiastes",12],["Song of Solomon",8],["Isaiah",66],["Jeremiah",52],["Lamentations",5],["Ezekiel",48],["Daniel",12],["Hosea",14],["Joel",3],["Amos",9],["Obadiah",1],["Jonah",4],["Micah",7],["Nahum",3],["Habakkuk",3],["Zephaniah",3],["Haggai",2],["Zechariah",14],["Malachi",4]];
export const NT: [string, number][] = [["Matthew",28],["Mark",16],["Luke",24],["John",21],["Acts",28],["Romans",16],["1 Corinthians",16],["2 Corinthians",13],["Galatians",6],["Ephesians",6],["Philippians",4],["Colossians",4],["1 Thessalonians",5],["2 Thessalonians",3],["1 Timothy",6],["2 Timothy",4],["Titus",3],["Philemon",1],["Hebrews",13],["James",5],["1 Peter",5],["2 Peter",3],["1 John",5],["2 John",1],["3 John",1],["Jude",1],["Revelation",22]];
export const ALL_BOOKS: [string, number][] = [...OT, ...NT];

export const TRANSLATIONS: [string, string][] = [
  ["web", "World English Bible"],
  ["kjv", "King James Version"],
  ["asv", "American Standard Version"],
];

// ————— Daily verses (WEB, curated across both testaments) —————
export const DAILY_VERSES = [
  { ref: "Psalm 46:1", book: "Psalms", chapter: 46, text: "God is our refuge and strength, a very present help in trouble." },
  { ref: "John 1:5", book: "John", chapter: 1, text: "The light shines in the darkness, and the darkness hasn’t overcome it." },
  { ref: "Micah 6:8", book: "Micah", chapter: 6, text: "He has shown you, O man, what is good. What does Yahweh require of you, but to act justly, to love mercy, and to walk humbly with your God?" },
  { ref: "Matthew 5:9", book: "Matthew", chapter: 5, text: "Blessed are the peacemakers, for they shall be called children of God." },
  { ref: "Psalm 23:1", book: "Psalms", chapter: 23, text: "Yahweh is my shepherd; I shall lack nothing." },
  { ref: "Isaiah 40:31", book: "Isaiah", chapter: 40, text: "But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles. They will run, and not be weary. They will walk, and not faint." },
  { ref: "Romans 8:38–39", book: "Romans", chapter: 8, text: "For I am persuaded that neither death, nor life, nor angels, nor principalities, nor things present, nor things to come, nor powers, nor height, nor depth, nor any other created thing will be able to separate us from God’s love." },
  { ref: "Proverbs 3:5", book: "Proverbs", chapter: 3, text: "Trust in Yahweh with all your heart, and don’t lean on your own understanding." },
  { ref: "Matthew 11:28", book: "Matthew", chapter: 11, text: "Come to me, all you who labor and are heavily burdened, and I will give you rest." },
  { ref: "Psalm 121:1–2", book: "Psalms", chapter: 121, text: "I will lift up my eyes to the hills. Where does my help come from? My help comes from Yahweh, who made heaven and earth." },
  { ref: "Joshua 1:9", book: "Joshua", chapter: 1, text: "Haven’t I commanded you? Be strong and courageous. Don’t be afraid. Don’t be dismayed, for Yahweh your God is with you wherever you go." },
  { ref: "1 Corinthians 13:13", book: "1 Corinthians", chapter: 13, text: "But now faith, hope, and love remain — these three. The greatest of these is love." },
  { ref: "Lamentations 3:22–23", book: "Lamentations", chapter: 3, text: "It is because of Yahweh’s loving kindnesses that we are not consumed, because his mercies don’t fail. They are new every morning. Great is your faithfulness." },
  { ref: "John 13:34", book: "John", chapter: 13, text: "A new commandment I give to you, that you love one another. Just as I have loved you, you also love one another." },
  { ref: "Psalm 34:18", book: "Psalms", chapter: 34, text: "Yahweh is near to those who have a broken heart, and saves those who have a crushed spirit." },
  { ref: "Galatians 5:22–23", book: "Galatians", chapter: 5, text: "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faith, gentleness, and self-control." },
  { ref: "Genesis 1:27", book: "Genesis", chapter: 1, text: "God created man in his own image. In God’s image he created him; male and female he created them." },
  { ref: "Philippians 4:6–7", book: "Philippians", chapter: 4, text: "In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your thoughts." },
  { ref: "Ecclesiastes 3:1", book: "Ecclesiastes", chapter: 3, text: "For everything there is a season, and a time for every purpose under heaven." },
  { ref: "Luke 6:31", book: "Luke", chapter: 6, text: "As you would like people to do to you, do exactly so to them." },
  { ref: "Psalm 139:14", book: "Psalms", chapter: 139, text: "I will give thanks to you, for I am fearfully and wonderfully made. Your works are wonderful. My soul knows that very well." },
  { ref: "Isaiah 41:10", book: "Isaiah", chapter: 41, text: "Don’t you be afraid, for I am with you. Don’t be dismayed, for I am your God. I will strengthen you. Yes, I will help you." },
  { ref: "James 1:19", book: "James", chapter: 1, text: "So, then, my beloved brothers, let every man be swift to hear, slow to speak, and slow to anger." },
  { ref: "Ruth 1:16", book: "Ruth", chapter: 1, text: "Where you go, I will go; and where you stay, I will stay. Your people will be my people, and your God my God." },
  { ref: "John 8:12", book: "John", chapter: 8, text: "I am the light of the world. He who follows me will not walk in the darkness, but will have the light of life." },
  { ref: "Psalm 27:1", book: "Psalms", chapter: 27, text: "Yahweh is my light and my salvation. Whom shall I fear? Yahweh is the strength of my life. Of whom shall I be afraid?" },
  { ref: "Colossians 3:12", book: "Colossians", chapter: 3, text: "Put on therefore, as God’s chosen ones, holy and beloved, a heart of compassion, kindness, lowliness, humility, and perseverance." },
  { ref: "Zephaniah 3:17", book: "Zephaniah", chapter: 3, text: "Yahweh, your God, is among you, a mighty one who will save. He will rejoice over you with joy. He will calm you in his love." },
];

export function todaysVerse() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}

export function normalizeBook(name: string) {
  const found = ALL_BOOKS.find(([b]) => b.toLowerCase() === name.toLowerCase());
  return found ? found[0] : name;
}
