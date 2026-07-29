import { useState, useEffect, useRef } from "react";

// ————— Palette & type (Lamplit reading-room) —————
const C = {
  paper: "#EFF1EA",
  card: "#F7F8F3",
  ink: "#22301F",
  inkSoft: "#4A5843",
  gold: "#A67C2E",
  goldSoft: "#E9DFC8",
  deep: "#2E4230",
  border: "#D8DACB",
  white: "#FDFDFB",
};

const HIGHLIGHTS = {
  gold: "#F0E3BD",
  green: "#DCE8D4",
  rose: "#F0DBD6",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Lora:ital,wght@0,400;0,500;1,400&family=Albert+Sans:wght@400;500;600&display=swap');
`;

// ————— All 66 books —————
const OT = [["Genesis",50],["Exodus",40],["Leviticus",27],["Numbers",36],["Deuteronomy",34],["Joshua",24],["Judges",21],["Ruth",4],["1 Samuel",31],["2 Samuel",24],["1 Kings",22],["2 Kings",25],["1 Chronicles",29],["2 Chronicles",36],["Ezra",10],["Nehemiah",13],["Esther",10],["Job",42],["Psalms",150],["Proverbs",31],["Ecclesiastes",12],["Song of Solomon",8],["Isaiah",66],["Jeremiah",52],["Lamentations",5],["Ezekiel",48],["Daniel",12],["Hosea",14],["Joel",3],["Amos",9],["Obadiah",1],["Jonah",4],["Micah",7],["Nahum",3],["Habakkuk",3],["Zephaniah",3],["Haggai",2],["Zechariah",14],["Malachi",4]];
const NT = [["Matthew",28],["Mark",16],["Luke",24],["John",21],["Acts",28],["Romans",16],["1 Corinthians",16],["2 Corinthians",13],["Galatians",6],["Ephesians",6],["Philippians",4],["Colossians",4],["1 Thessalonians",5],["2 Thessalonians",3],["1 Timothy",6],["2 Timothy",4],["Titus",3],["Philemon",1],["Hebrews",13],["James",5],["1 Peter",5],["2 Peter",3],["1 John",5],["2 John",1],["3 John",1],["Jude",1],["Revelation",22]];
const ALL_BOOKS = [...OT, ...NT];

const TRANSLATIONS = [
  ["web", "World English Bible"],
  ["kjv", "King James Version"],
  ["asv", "American Standard Version"],
];

// ————— Daily verses (WEB, curated across both testaments) —————
const DAILY_VERSES = [
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

function todaysVerse() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}

// ————— Offline samples (WEB) shown if live fetch is blocked in this preview —————
const OFFLINE = {
  "John|1": [["1","In the beginning was the Word, and the Word was with God, and the Word was God."],["2","The same was in the beginning with God."],["3","All things were made through him. Without him, nothing was made that has been made."],["4","In him was life, and the life was the light of men."],["5","The light shines in the darkness, and the darkness hasn’t overcome it."],["9","The true light that enlightens everyone was coming into the world."],["12","But as many as received him, to them he gave the right to become God’s children, to those who believe in his name."],["14","The Word became flesh and lived among us. We saw his glory, such glory as of the only born Son of the Father, full of grace and truth."],["16","From his fullness we all received grace upon grace."],["17","For the law was given through Moses. Grace and truth were realized through Jesus Christ."]],
  "Psalms|23": [["1","Yahweh is my shepherd; I shall lack nothing."],["2","He makes me lie down in green pastures. He leads me beside still waters."],["3","He restores my soul. He guides me in the paths of righteousness for his name’s sake."],["4","Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me. Your rod and your staff, they comfort me."],["5","You prepare a table before me in the presence of my enemies. You anoint my head with oil. My cup runs over."],["6","Surely goodness and loving kindness shall follow me all the days of my life, and I will dwell in Yahweh’s house forever."]],
  "Genesis|1": [["1","In the beginning, God created the heavens and the earth."],["2","The earth was formless and empty. Darkness was on the surface of the deep and God’s Spirit was hovering over the surface of the waters."],["3","God said, “Let there be light,” and there was light."],["4","God saw the light, and saw that it was good. God divided the light from the darkness."],["5","God called the light “day”, and the darkness he called “night”. There was evening and there was morning, the first day."]],
  "Matthew|5": [["1","Seeing the multitudes, he went up onto the mountain. When he had sat down, his disciples came to him."],["2","He opened his mouth and taught them, saying,"],["3","“Blessed are the poor in spirit, for theirs is the Kingdom of Heaven."],["4","Blessed are those who mourn, for they shall be comforted."],["5","Blessed are the gentle, for they shall inherit the earth."],["6","Blessed are those who hunger and thirst for righteousness, for they shall be filled."],["7","Blessed are the merciful, for they shall obtain mercy."],["8","Blessed are the pure in heart, for they shall see God."],["9","Blessed are the peacemakers, for they shall be called children of God."]],
};

// ————— Reading plans —————
const PLANS = [
  {
    id: "begin",
    title: "Where to Begin",
    blurb: "Seven short readings for anyone opening the Bible for the first time — no background assumed.",
    days: [
      ["Creation", "Genesis", 1],
      ["A shepherd’s song", "Psalms", 23],
      ["The Word made flesh", "John", 1],
      ["Three lost things", "Luke", 15],
      ["The Beatitudes", "Matthew", 5],
      ["God so loved the world", "John", 3],
      ["Nothing can separate us", "Romans", 8],
    ],
  },
  {
    id: "jesus",
    title: "The Life of Jesus",
    blurb: "Fourteen days through Luke’s account — birth, teaching, friendship, death, and resurrection.",
    days: [
      ["An announcement", "Luke", 1],
      ["A birth in Bethlehem", "Luke", 2],
      ["Preparation", "Luke", 3],
      ["Testing and calling", "Luke", 4],
      ["First followers", "Luke", 5],
      ["A new way to live", "Luke", 6],
      ["Parables and storms", "Luke", 8],
      ["Who do you say I am?", "Luke", 9],
      ["The good Samaritan", "Luke", 10],
      ["Lost and found", "Luke", 15],
      ["Zacchaeus and a colt", "Luke", 19],
      ["The last supper", "Luke", 22],
      ["The cross", "Luke", 23],
      ["The empty tomb", "Luke", 24],
    ],
  },
  {
    id: "psalms",
    title: "Songs for Hard Days",
    blurb: "Seven psalms people have leaned on for three thousand years — for grief, fear, and hope.",
    days: [
      ["The shepherd", "Psalms", 23],
      ["Light and stronghold", "Psalms", 27],
      ["Taste and see", "Psalms", 34],
      ["Why so downcast?", "Psalms", 42],
      ["A very present help", "Psalms", 46],
      ["Under his wings", "Psalms", 91],
      ["Searched and known", "Psalms", 139],
    ],
  },
  {
    id: "story",
    title: "The Big Story in 30 Days",
    blurb: "One chapter a day, Genesis to Revelation — the whole arc of the Bible in a month.",
    days: [
      ["Creation", "Genesis", 1],
      ["The fall", "Genesis", 3],
      ["A promise to Abram", "Genesis", 12],
      ["Joseph sold", "Genesis", 37],
      ["Joseph forgives", "Genesis", 45],
      ["The burning bush", "Exodus", 3],
      ["Through the sea", "Exodus", 14],
      ["Ten words", "Exodus", 20],
      ["Hear, O Israel", "Deuteronomy", 6],
      ["Be strong and courageous", "Joshua", 1],
      ["A shepherd king chosen", "1 Samuel", 16],
      ["A house forever", "2 Samuel", 7],
      ["Fire on Carmel", "1 Kings", 18],
      ["A child is born", "Isaiah", 9],
      ["The suffering servant", "Isaiah", 53],
      ["A new covenant", "Jeremiah", 31],
      ["The lions’ den", "Daniel", 6],
      ["A runaway prophet", "Jonah", 1],
      ["What does the Lord require?", "Micah", 6],
      ["A birth in Bethlehem", "Luke", 2],
      ["The Beatitudes", "Matthew", 5],
      ["Seeds and soil", "Mark", 4],
      ["Lazarus", "John", 11],
      ["The cross", "Luke", 23],
      ["Resurrection", "Luke", 24],
      ["The Spirit comes", "Acts", 2],
      ["No separation", "Romans", 8],
      ["The greatest of these", "1 Corinthians", 13],
      ["The mind of Christ", "Philippians", 2],
      ["All things new", "Revelation", 21],
    ],
  },
];

// ————— AI plumbing —————
const COMPANION_SYSTEM = `You are the Study Companion for Lampstand, a non-profit Bible study platform whose mission is that everyone — of any denomination, any faith background, or none — feels welcome learning about the Bible.

Your posture:
- Be warm, plain-spoken, and unhurried. Assume zero prior knowledge unless shown otherwise.
- Explain what the text says, its historical and cultural context, its literary form, and how it connects to other passages.
- On interpretive or contested questions, describe how major traditions (e.g., Catholic, Orthodox, Protestant families, and where relevant Jewish readings of the Hebrew Bible) have historically understood the passage — fairly, by name, without declaring a winner.
- Never pressure, condemn, or proselytize. Never speak on behalf of God. You are a study tool, not a spiritual authority.
- For personal, pastoral, or interpretive decisions, gently encourage the person to also talk with their own faith community, clergy, or trusted mentors.
- Quote scripture from the World English Bible (public domain) when quoting, and always name the reference (book chapter:verse).

Grounding rules:
- A SOURCES block may follow these instructions. Treat it as your primary material: quote scripture from it, use its background notes and cross-references, and mark claims drawn from it with the source tag in square brackets, e.g. [S1] or [S2], right after the sentence that uses it.
- Clearly distinguish three kinds of statements: what the text SAYS (quote it), historical/scholarly CONTEXT (attribute it, noting where scholars differ), and INTERPRETATION (attribute to the traditions that hold it, never to yourself).
- If the sources don't cover something, you may still answer from general knowledge, but say so plainly ("beyond these sources…") rather than implying it came from the sources.
- Never invent quotations or attribute words to any commentary, scholar, or tradition unless you are quoting the SOURCES block or scripture itself.

Keep answers focused and readable: short paragraphs, roughly 150-250 words unless the person asks for depth.`;

const GUIDE_SYSTEM = `You create small-group Bible study discussion guides for Lampstand, a non-profit, all-are-welcome study platform. Given a passage or topic and a group description, produce a guide with: a 2-3 sentence opening summary of the passage in context; 5 discussion questions moving from observation to meaning to reflection; one respectful note on any point where traditions differ, presented neutrally; and a short optional closing reflection or prayer. Warm, plain language. No denominational stance. Simple headings.`;

async function askClaude(system, messages) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system, messages }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "Request failed");
  return data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
}

// ————— Scripture fetching (bible-api.com) —————
const chapterCache = {};

async function fetchChapter(book, chapter, translation) {
  const key = `${book}|${chapter}|${translation}`;
  if (chapterCache[key]) return chapterCache[key];
  const url = `https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=${translation}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Fetch failed");
  const data = await res.json();
  const verses = (data.verses || []).map((v) => [String(v.verse), v.text.replace(/\s+/g, " ").trim()]);
  if (!verses.length) throw new Error("No verses");
  const out = { verses, translationName: data.translation_name || translation.toUpperCase() };
  chapterCache[key] = out;
  return out;
}

// ————— Marks (highlights + verse notes) storage —————
async function loadMarks() {
  try {
    const result = await window.storage.get("lampstand-marks");
    return result?.value ? JSON.parse(result.value) : {};
  } catch {
    return {};
  }
}

async function saveMarks(marks) {
  try {
    await window.storage.set("lampstand-marks", JSON.stringify(marks));
  } catch {
    // stays in memory this session
  }
}

// ————— Reference library (Lampstand study notes; cross-references follow classic public-domain reference tradition) —————
const BOOK_NOTES = {
  "Genesis": "Genesis is the Bible’s book of beginnings: creation, the flood, and the family stories of Abraham, Isaac, Jacob, and Joseph. It is Hebrew narrative rich in pattern and wordplay. Jewish and Christian traditions alike read it as the foundation of covenant; scholars discuss its composition history, with dates proposed across a wide range of the first millennium BCE.",
  "Exodus": "Exodus tells of Israel’s slavery in Egypt, deliverance through Moses, the covenant at Sinai, and the giving of the law. Its themes — liberation, covenant, God’s presence — echo through both testaments, and the Passover it establishes remains central to Jewish life today.",
  "Deuteronomy": "Deuteronomy presents Moses’ farewell speeches on the edge of the promised land, restating the law with the heart-centered call of the Shema: “Hear, O Israel.” Jesus quotes it more than almost any other book.",
  "Joshua": "Joshua narrates Israel’s entry into Canaan. It raises hard questions about conquest and violence that readers and traditions have wrestled with honestly for centuries; its own refrain, though, is covenant faithfulness and courage.",
  "Ruth": "Ruth is a short story of loyalty across ethnic lines: a Moabite widow who binds herself to her Israelite mother-in-law and becomes an ancestor of David. It is read in Jewish tradition at Shavuot and treasured across traditions as a story of chesed — loyal love.",
  "1 Samuel": "1 Samuel traces Israel’s move from judges to monarchy: Samuel, Saul, and the rise of David. It is candid about the costs of kingship and the complexity of its heroes.",
  "2 Samuel": "2 Samuel follows David’s reign — his triumphs, his covenant promise of an everlasting house, and his failures, told with unusual honesty for ancient royal literature.",
  "Psalms": "Psalms is the Bible’s prayer book: 150 poems of praise, lament, thanksgiving, anger, and trust, composed over centuries. Roughly a third are laments, which is why people in pain have always found their own voice here. Jewish and Christian worship both grew up around these songs.",
  "Proverbs": "Proverbs collects Israel’s wisdom tradition — short sayings about character, speech, work, and the “fear of the LORD” as the beginning of wisdom. Proverbs are patterns, not promises: they describe how life usually goes.",
  "Ecclesiastes": "Ecclesiastes is wisdom literature in a minor key: “vanity of vanities” (Hebrew hevel, vapor/breath). It stares honestly at mortality and injustice, and still commends simple joys — bread, work, companionship — as gifts.",
  "Isaiah": "Isaiah spans judgment and extraordinary hope: a holy God, a remnant, a coming servant, new creation. Scholars commonly discuss the book as reflecting more than one historical period; Jewish tradition reads the servant passages corporately of Israel, while Christian tradition has read them of the Messiah — a genuine and respectful difference.",
  "Jeremiah": "Jeremiah prophesied through Jerusalem’s fall in 586 BCE — the Bible’s most personally transparent prophet, weeping over his city yet promising a “new covenant written on the heart.”",
  "Daniel": "Daniel combines court stories of faithfulness under empire (the lions’ den, the furnace) with apocalyptic visions. Its imagery shapes later Jewish and Christian hope; traditions differ widely on how to read its visions.",
  "Jonah": "Jonah is a short, artful story about a prophet who runs from mercy. Its punchline is God’s question about compassion for Nineveh — Israel’s enemy. Jewish tradition reads it on Yom Kippur.",
  "Micah": "Micah alternates judgment and hope, and contains one of scripture’s most quoted summaries of the good life: act justly, love mercy, walk humbly (Micah 6:8).",
  "Matthew": "Matthew, the most Jewish-facing Gospel, presents Jesus as the fulfillment of Israel’s story, organizing his teaching into five great discourses beginning with the Sermon on the Mount. Likely written for a community of Jewish followers of Jesus in the later first century.",
  "Mark": "Mark is the shortest, fastest Gospel — “immediately” is a favorite word — presenting Jesus as the suffering Son of God. Most scholars consider it the earliest Gospel, written around 65-70 CE.",
  "Luke": "Luke, a careful narrative addressed to “Theophilus,” emphasizes the poor, women, outsiders, prayer, and joy. Its parables — the good Samaritan, the prodigal son — are among the most loved stories ever told. Acts is its second volume.",
  "John": "John is the most theological Gospel, opening not in Bethlehem but “in the beginning,” presenting Jesus as the eternal Word made flesh, with seven signs and seven “I am” sayings. It reads as long meditation rather than fast narrative.",
  "Acts": "Acts continues Luke’s story: the Spirit at Pentecost and the movement’s spread from Jerusalem to Rome, through Peter and then Paul. It is the bridge between the Gospels and the letters.",
  "Romans": "Romans is Paul’s longest and most systematic letter — sin, grace, faith, Israel, and life in the Spirit — written to a church he had not yet visited. It has repeatedly reshaped Christian history, from Augustine to Luther to Barth; traditions read its key terms differently, which is part of its story.",
  "1 Corinthians": "1 Corinthians addresses a gifted, divided church in a cosmopolitan port city — factions, ethics, worship, the resurrection — and contains the famous hymn to love in chapter 13, written not for weddings but for a quarreling community.",
  "Galatians": "Galatians is Paul at his most urgent: a defense that Gentile believers belong fully, by faith, without first becoming Jewish proselytes. “There is neither Jew nor Greek… you are all one” (3:28).",
  "Philippians": "Philippians is a warm letter from prison, centered on the Christ-hymn of chapter 2 — self-emptying humility — and repeated calls to joy.",
  "Hebrews": "Hebrews is a sermon-like work presenting Jesus through the imagery of Israel’s worship — priest, sacrifice, covenant — urging endurance. Its author is unknown; “God alone knows,” as Origen said in antiquity.",
  "James": "James is practical wisdom for scattered communities: taming the tongue, caring for the poor, faith that shows itself in works. It reads like a New Testament book of Proverbs.",
  "Revelation": "Revelation is apocalyptic literature — resistance poetry written in symbols to churches under pressure, ending not with escape from earth but heaven come down: “God will wipe away every tear.” Traditions differ more over how to read this book than almost any other; the main historic approaches (idealist, preterist, historicist, futurist) each have serious advocates.",
};

const CROSS_REFS = {
  "Genesis|1": "John 1:1-3 (creation through the Word); Psalm 33:6-9 (by the word of the LORD); Hebrews 11:3 (framed by God’s word); Colossians 1:15-17 (all things created); Psalm 8 (humanity’s place in creation)",
  "Psalms|23": "John 10:11-15 (the good shepherd); Ezekiel 34:11-16 (God himself will shepherd); Psalm 100:3 (the sheep of his pasture); Revelation 7:17 (the Lamb will shepherd them)",
  "John|1": "Genesis 1:1-5 (in the beginning; light and darkness); Proverbs 8:22-31 (wisdom present at creation); Colossians 1:15-20 (the image of the invisible God); 1 John 1:1-4 (that which we have seen); Exodus 33:18-23 with John 1:18 (seeing God)",
  "Matthew|5": "Luke 6:20-26 (the parallel blessings and woes); Psalm 37:11 (the meek inherit the land); Isaiah 61:1-3 (good news to the poor, comfort to mourners); Psalm 24:3-4 (clean hands, pure heart)",
  "John|3": "Numbers 21:8-9 (the serpent lifted up); Ezekiel 36:25-27 (water and a new spirit); John 12:32 (lifted up, drawing all)",
  "Luke|15": "Ezekiel 34:11-16 (seeking the lost sheep); Psalm 103:8-13 (as a father has compassion); Jeremiah 31:18-20 (Ephraim, my dear son)",
  "Romans|8": "Psalm 44:22 (for your sake we face death); Isaiah 50:8-9 (he who vindicates me is near); Genesis 8:21-22 with Romans 8:19-22 (creation waiting)",
  "Exodus|20": "Deuteronomy 5:6-21 (the commandments restated); Matthew 22:36-40 (the law summarized in love); Psalm 19:7-11 (the law of the LORD is perfect)",
  "Isaiah|53": "Acts 8:32-35 (the Ethiopian reading this passage); 1 Peter 2:22-25 (by his wounds); Psalm 22 (the righteous sufferer)",
  "1 Corinthians|13": "John 13:34-35 (by this everyone will know); 1 John 4:7-12 (love is from God); Romans 13:8-10 (love fulfills the law)",
  "Genesis|3": "Romans 5:12-19 (through one man); Revelation 22:1-3 (the curse undone); Genesis 4:7 (sin crouching at the door)",
  "Luke|24": "1 Corinthians 15:3-8 (appearances of the risen Jesus); Psalm 16:9-11 (you will not abandon me to the grave); Isaiah 25:7-8 (death swallowed up)",
};

const GLOSSARY = {
  "covenant": "Covenant: a formal bond of relationship and obligation. The Bible’s story is structured by covenants — with Noah, Abraham, Israel at Sinai, David — and Jeremiah 31 promises a “new covenant.” Jewish and Christian traditions both center on covenant while understanding its continuity differently.",
  "grace": "Grace: favor freely given, not earned. Hebrew chen/chesed; Greek charis. All Christian traditions affirm salvation by grace; the Reformation-era debates concerned how grace, faith, and works relate, and remain a genuine point of difference between (and within) traditions.",
  "messiah": "Messiah: Hebrew mashiach, “anointed one” (Greek christos). In the Hebrew Bible, kings and priests are anointed; later Jewish hope looked for a coming anointed deliverer. Christians confess Jesus as this Messiah; Judaism does not — the central historic difference between the two faiths, best stated plainly and respectfully.",
  "sabbath": "Sabbath: the seventh day of rest, grounded in creation (Genesis 2:2-3) and covenant (Exodus 20:8-11). Kept from Friday evening to Saturday evening in Judaism; most Christians historically moved communal worship to Sunday (the day of resurrection), with practice varying by tradition.",
  "sin": "Sin: the Bible’s vocabulary includes missing the mark (chata), rebellion (pesha), and crookedness (avon). Traditions differ on how deeply sin affects human nature (e.g., views of “original sin” differ between Orthodox, Catholic, and Protestant thought, and Jewish tradition frames the inclination to evil differently).",
  "faith": "Faith: Hebrew emunah (steadfastness, trust), Greek pistis (trust, allegiance, belief). Biblically it is closer to trusting loyalty than mere intellectual agreement — “the assurance of things hoped for” (Hebrews 11:1).",
  "law": "Law/Torah: Hebrew torah means “instruction” more than legal code — the first five books, and the way of life they teach. Psalm 119 celebrates it as delight; Paul’s letters wrestle with its role for Gentiles; Judaism continues to treasure and interpret it as covenant instruction.",
  "kingdom of god": "Kingdom of God: God’s reign — the central theme of Jesus’ preaching (“the kingdom of God is at hand,” Mark 1:15). Traditions discuss how far it is present now versus still to come; most hold both: “already and not yet.”",
  "parable": "Parable: a short story or comparison that invites the hearer to see differently — Jesus’ characteristic teaching form, standing in the tradition of Nathan’s story to David (2 Samuel 12). Parables aim at the will, not just the mind.",
  "prophet": "Prophet: not primarily a future-teller but a covenant messenger — calling people back to justice and faithfulness (“let justice roll down like waters,” Amos 5:24). The Hebrew Bible groups Joshua–Kings as “Former Prophets” and Isaiah–Malachi as “Latter Prophets.”",
  "gospel": "Gospel: Greek euangelion, “good news” — a word used in the Roman world for imperial announcements, claimed by the early church for the announcement about Jesus. Also the name of the four books that tell his story, each with its own emphasis.",
  "apostle": "Apostle: Greek apostolos, “one who is sent” — used of the Twelve, of Paul, and of others in the earliest communities (including Junia in Romans 16:7, discussed in scholarship).",
  "resurrection": "Resurrection: bodily rising from death — a hope that grew within Judaism (Daniel 12:2) and stands at the center of Christian faith (1 Corinthians 15). Distinct from the Greek idea of an immortal soul escaping the body: it is the body’s renewal.",
  "baptism": "Baptism: a washing with water marking entry into the community of Jesus’ followers. Traditions genuinely differ on mode (immersion, pouring), subjects (infants or believers), and meaning (sacrament conveying grace, or ordinance of testimony) — each view held seriously and scripturally by its tradition.",
  "trinity": "Trinity: the historic Christian confession of one God in three persons — Father, Son, Holy Spirit — formulated at Nicaea (325 CE) and Constantinople (381 CE) from the pressure of biblical language itself. Judaism and Islam affirm God’s oneness without this formulation; within Christianity it is shared by Orthodox, Catholic, and historic Protestant traditions.",
};

// ————— Source gathering (the grounding pipeline) —————
const BOOK_PATTERN = new RegExp(
  "\\b(" + ALL_BOOKS.map(([b]) => b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).sort((a, b) => b.length - a.length).join("|") + ")\\s+(\\d{1,3})(?::(\\d{1,3}))?",
  "i"
);

function normalizeBook(name) {
  const found = ALL_BOOKS.find(([b]) => b.toLowerCase() === name.toLowerCase());
  return found ? found[0] : name;
}

async function gatherSources(question, history) {
  const sources = [];
  const blocks = [];
  let n = 0;

  function add(kind, label, content) {
    n += 1;
    const id = `S${n}`;
    sources.push({ id, kind, label });
    blocks.push(`[${id}] (${kind}) ${label}\n${content}`);
  }

  // Look for a scripture reference in the question, falling back to recent conversation
  const recentText = [question, ...history.slice(-4).map((m) => m.content)].join("\n");
  const match = question.match(BOOK_PATTERN) || recentText.match(BOOK_PATTERN);

  if (match) {
    const book = normalizeBook(match[1]);
    const chapter = Number(match[2]);

    // The passage itself — real text, fetched live
    try {
      const data = await fetchChapter(book, chapter, "web");
      const text = data.verses.map(([v, t]) => `${v} ${t}`).join(" ");
      add("Scripture — World English Bible", `${book} ${chapter}`, text.length > 2600 ? text.slice(0, 2600) + "…" : text);
    } catch {
      const offline = OFFLINE[`${book}|${chapter}`];
      if (offline) {
        add("Scripture — World English Bible (excerpt)", `${book} ${chapter}`, offline.map(([v, t]) => `${v} ${t}`).join(" "));
      }
    }

    if (BOOK_NOTES[book]) {
      add("Background — Lampstand study notes", `About the book of ${book}`, BOOK_NOTES[book]);
    }
    if (CROSS_REFS[`${book}|${chapter}`]) {
      add("Cross-references — classic reference tradition", `Passages connected to ${book} ${chapter}`, CROSS_REFS[`${book}|${chapter}`]);
    }
  }

  // Glossary terms mentioned in the question
  const q = question.toLowerCase();
  for (const [term, entry] of Object.entries(GLOSSARY)) {
    if (q.includes(term) && n < 6) {
      add("Glossary — Lampstand study notes", entry.split(":")[0], entry);
    }
  }

  const sourceBlock = blocks.length
    ? `SOURCES:\n${blocks.join("\n\n")}`
    : "";
  return { sources, sourceBlock };
}

// ————— UI atoms —————
function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 sm:px-4 py-2 text-sm font-medium transition-colors focus:outline-none whitespace-nowrap"
      style={{
        fontFamily: "'Albert Sans', sans-serif",
        color: active ? C.ink : C.inkSoft,
        borderBottom: active ? `2px solid ${C.gold}` : "2px solid transparent",
      }}
    >
      {label}
    </button>
  );
}

function GoldButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-5 py-2 rounded-full text-sm font-semibold transition-opacity focus:outline-none"
      style={{
        fontFamily: "'Albert Sans', sans-serif",
        background: disabled ? C.goldSoft : C.gold,
        color: disabled ? C.inkSoft : C.white,
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {children}
    </button>
  );
}

function QuietButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full text-sm font-semibold focus:outline-none"
      style={{
        fontFamily: "'Albert Sans', sans-serif",
        background: "transparent",
        border: `1px solid ${C.border}`,
        color: C.ink,
      }}
    >
      {children}
    </button>
  );
}

const selectStyle = {
  fontFamily: "'Albert Sans', sans-serif",
  background: C.white,
  border: `1px solid ${C.border}`,
  color: C.ink,
};

// ————— Today (home) tab —————
function TodayTab({ onOpenReading, onAskAbout, goToPlans }) {
  const verse = todaysVerse();
  const [resume, setResume] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("lampstand-plans");
        const progress = result?.value ? JSON.parse(result.value) : {};
        const items = [];
        for (const plan of PLANS) {
          const done = new Set(progress[plan.id] || []);
          if (done.size > 0 && done.size < plan.days.length) {
            const nextIdx = plan.days.findIndex((_, i) => !done.has(i));
            if (nextIdx !== -1) {
              items.push({ plan, nextIdx, done: done.size });
            }
          }
        }
        setResume(items);
      } catch {
        // no progress yet
      }
    })();
  }, []);

  const dateStr = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div>
      <p className="text-xs mb-6" style={{ color: C.gold, fontFamily: "'Albert Sans', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {dateStr}
      </p>

      <div className="rounded-3xl px-6 py-8 sm:px-10 sm:py-10 mb-8" style={{ background: C.deep }}>
        <p className="text-xs mb-4" style={{ color: C.goldSoft, fontFamily: "'Albert Sans', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Verse for today
        </p>
        <p className="leading-relaxed mb-5" style={{ fontFamily: "'Fraunces', serif", fontSize: 24, color: C.white }}>
          “{verse.text}”
        </p>
        <p className="text-sm mb-6" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.goldSoft }}>
          {verse.ref} · World English Bible
        </p>
        <div className="flex flex-wrap gap-2">
          <GoldButton onClick={() => onOpenReading(verse.book, verse.chapter)}>Read the chapter</GoldButton>
          <button
            onClick={() => onAskAbout(`${verse.ref} — “${verse.text}” — can you help me understand this verse and its context?`)}
            className="px-4 py-2 rounded-full text-sm font-semibold focus:outline-none"
            style={{ fontFamily: "'Albert Sans', sans-serif", background: "transparent", border: `1px solid ${C.goldSoft}`, color: C.goldSoft }}
          >
            Ask about this verse
          </button>
        </div>
      </div>

      {resume.length > 0 ? (
        <div>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: C.ink }} className="mb-3">
            Pick up where you left off
          </h3>
          <div className="space-y-2">
            {resume.map(({ plan, nextIdx, done }) => (
              <div key={plan.id} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px]" style={{ fontFamily: "'Lora', serif", color: C.ink }}>{plan.title}</p>
                  <p className="text-xs" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
                    Day {nextIdx + 1} of {plan.days.length} · {plan.days[nextIdx][0]} ({plan.days[nextIdx][1]} {plan.days[nextIdx][2]})
                  </p>
                </div>
                <button
                  onClick={() => onOpenReading(plan.days[nextIdx][1], plan.days[nextIdx][2])}
                  className="text-xs font-semibold focus:outline-none flex-shrink-0"
                  style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}
                >
                  Read →
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl px-5 py-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-[15px] mb-1" style={{ fontFamily: "'Lora', serif", color: C.ink }}>
            A little each day goes a long way.
          </p>
          <button
            onClick={goToPlans}
            className="text-sm font-semibold focus:outline-none"
            style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}
          >
            Start a reading plan →
          </button>
        </div>
      )}
    </div>
  );
}

// ————— Read tab: full reader with highlights & notes —————
function ReadTab({ target, clearTarget, onAskAbout }) {
  const [book, setBook] = useState("John");
  const [chapter, setChapter] = useState(1);
  const [translation, setTranslation] = useState("web");
  const [verses, setVerses] = useState(null);
  const [sourceNote, setSourceNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [marks, setMarks] = useState({});
  const [noteDraft, setNoteDraft] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);

  useEffect(() => {
    loadMarks().then(setMarks);
  }, []);

  useEffect(() => {
    if (target) {
      setBook(target.book);
      setChapter(target.chapter);
      clearTarget();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setSelected(null);
      setNoteOpen(false);
      setVerses(null);
      try {
        const data = await fetchChapter(book, chapter, translation);
        if (cancelled) return;
        setVerses(data.verses);
        setSourceNote(data.translationName);
      } catch {
        if (cancelled) return;
        const offline = OFFLINE[`${book}|${chapter}`];
        if (offline) {
          setVerses(offline);
          setSourceNote("World English Bible · offline sample (excerpt) — live text loads in the hosted version");
        } else {
          setVerses(null);
          setSourceNote("");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [book, chapter, translation]);

  const bookInfo = ALL_BOOKS.find(([b]) => b === book);
  const chapterCount = bookInfo ? bookInfo[1] : 1;
  const markKey = selected ? `${book}|${chapter}|${selected}` : null;
  const currentMark = markKey ? marks[markKey] : null;

  function selectVerse(num) {
    if (selected === num) {
      setSelected(null);
      setNoteOpen(false);
      return;
    }
    setSelected(num);
    const m = marks[`${book}|${chapter}|${num}`];
    setNoteDraft(m?.note || "");
    setNoteOpen(Boolean(m?.note));
  }

  async function setHighlight(color) {
    if (!markKey) return;
    const next = { ...marks };
    const existing = next[markKey] || {};
    if (existing.color === color) {
      // toggle off
      if (existing.note) {
        next[markKey] = { ...existing, color: null };
      } else {
        delete next[markKey];
      }
    } else {
      next[markKey] = { ...existing, color };
    }
    if (next[markKey] && !next[markKey].color && !next[markKey].note) delete next[markKey];
    setMarks(next);
    await saveMarks(next);
  }

  async function saveNote() {
    if (!markKey) return;
    const next = { ...marks };
    const existing = next[markKey] || {};
    const trimmed = noteDraft.trim();
    if (trimmed) {
      const verseText = verses?.find((v) => v[0] === selected)?.[1] || "";
      next[markKey] = { ...existing, note: trimmed, text: verseText.slice(0, 140) };
    } else if (existing.color) {
      next[markKey] = { color: existing.color, text: existing.text };
    } else {
      delete next[markKey];
    }
    setMarks(next);
    await saveMarks(next);
    if (!trimmed) setNoteOpen(false);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={book}
          onChange={(e) => { setBook(e.target.value); setChapter(1); }}
          className="rounded-xl px-3 py-2 text-sm focus:outline-none"
          style={selectStyle}
        >
          <optgroup label="Hebrew Bible / Old Testament">
            {OT.map(([b]) => <option key={b} value={b}>{b}</option>)}
          </optgroup>
          <optgroup label="New Testament">
            {NT.map(([b]) => <option key={b} value={b}>{b}</option>)}
          </optgroup>
        </select>
        <select
          value={chapter}
          onChange={(e) => setChapter(Number(e.target.value))}
          className="rounded-xl px-3 py-2 text-sm focus:outline-none"
          style={selectStyle}
        >
          {Array.from({ length: chapterCount }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>Chapter {n}</option>
          ))}
        </select>
        <select
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm focus:outline-none"
          style={selectStyle}
        >
          {TRANSLATIONS.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
      </div>

      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: C.ink }} className="mb-1">
        {book} {chapter}
      </h2>
      <p className="text-xs mb-6" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
        {sourceNote}{verses && " · tap a verse to highlight, note, or ask"}
      </p>

      {loading && (
        <p className="text-sm italic" style={{ color: C.inkSoft, fontFamily: "'Lora', serif" }}>
          Turning the pages…
        </p>
      )}

      {!loading && !verses && (
        <div className="rounded-2xl px-5 py-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-[15px] leading-relaxed" style={{ fontFamily: "'Lora', serif", color: C.ink }}>
            This preview sandbox can’t reach the scripture service, so only a few sample chapters are readable here (Genesis 1, Psalm 23, Matthew 5, John 1). In the hosted version, every chapter of all 66 books loads from bible-api.com — the code is already wired for it.
          </p>
        </div>
      )}

      {!loading && verses && (
        <div className="space-y-1 mb-4">
          {verses.map(([num, text]) => {
            const mark = marks[`${book}|${chapter}|${num}`];
            const isSelected = selected === num;
            return (
              <p
                key={num}
                onClick={() => selectVerse(num)}
                className="cursor-pointer rounded-lg px-3 py-2 transition-colors leading-relaxed"
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: 17,
                  color: C.ink,
                  background: isSelected ? C.goldSoft : mark?.color ? HIGHLIGHTS[mark.color] : "transparent",
                  outline: isSelected ? `1px solid ${C.gold}` : "none",
                }}
              >
                <sup className="mr-2 font-sans" style={{ color: C.gold, fontSize: 11 }}>{num}</sup>
                {text}
                {mark?.note && (
                  <span className="ml-2" style={{ color: C.gold, fontSize: 13 }} title="Has a note">✎</span>
                )}
              </p>
            );
          })}
        </div>
      )}

      {selected && verses && (
        <div
          className="sticky bottom-3 rounded-2xl px-4 py-4 shadow-lg"
          style={{ background: C.white, border: `1px solid ${C.border}` }}
        >
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <p className="text-xs font-semibold" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
              {book} {chapter}:{selected}
            </p>
            <div className="flex items-center gap-2">
              {Object.entries(HIGHLIGHTS).map(([name, hex]) => (
                <button
                  key={name}
                  onClick={() => setHighlight(name)}
                  aria-label={`Highlight ${name}`}
                  className="w-6 h-6 rounded-full focus:outline-none"
                  style={{
                    background: hex,
                    border: currentMark?.color === name ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
                  }}
                />
              ))}
              {currentMark?.color && (
                <button
                  onClick={() => setHighlight(currentMark.color)}
                  className="text-[11px] focus:outline-none"
                  style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex-1" />
            <button
              onClick={() => setNoteOpen(!noteOpen)}
              className="text-xs font-semibold focus:outline-none"
              style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}
            >
              {noteOpen ? "Hide note" : currentMark?.note ? "Edit note" : "＋ Add note"}
            </button>
            <button
              onClick={() =>
                onAskAbout(
                  `${book} ${chapter}:${selected} — “${verses.find((v) => v[0] === selected)[1]}” — can you help me understand this verse?`
                )
              }
              className="text-xs font-semibold focus:outline-none"
              style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}
            >
              Ask the Companion
            </button>
          </div>

          {noteOpen && (
            <div className="mt-3">
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Your thought on this verse…"
                rows={3}
                className="w-full rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none leading-relaxed"
                style={{ fontFamily: "'Lora', serif", background: C.paper, border: `1px solid ${C.border}`, color: C.ink }}
              />
              <GoldButton onClick={saveNote}>Save note</GoldButton>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between mt-10">
        <button
          onClick={() => setChapter(Math.max(1, chapter - 1))}
          disabled={chapter === 1}
          className="text-sm focus:outline-none"
          style={{ fontFamily: "'Albert Sans', sans-serif", color: chapter === 1 ? C.border : C.inkSoft }}
        >
          ← Previous chapter
        </button>
        <button
          onClick={() => setChapter(Math.min(chapterCount, chapter + 1))}
          disabled={chapter === chapterCount}
          className="text-sm focus:outline-none"
          style={{ fontFamily: "'Albert Sans', sans-serif", color: chapter === chapterCount ? C.border : C.inkSoft }}
        >
          Next chapter →
        </button>
      </div>
    </div>
  );
}

// ————— Plans tab —————
function PlansTab({ onOpenReading }) {
  const [progress, setProgress] = useState({});
  const [openPlan, setOpenPlan] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("lampstand-plans");
        if (result?.value) setProgress(JSON.parse(result.value));
      } catch {
        // no saved progress yet
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  async function toggleDay(planId, dayIndex) {
    const done = new Set(progress[planId] || []);
    done.has(dayIndex) ? done.delete(dayIndex) : done.add(dayIndex);
    const next = { ...progress, [planId]: [...done] };
    setProgress(next);
    try {
      await window.storage.set("lampstand-plans", JSON.stringify(next));
    } catch {
      // progress stays in memory this session
    }
  }

  if (!loaded) return null;

  if (openPlan) {
    const plan = PLANS.find((p) => p.id === openPlan);
    const done = new Set(progress[plan.id] || []);
    const pct = Math.round((done.size / plan.days.length) * 100);
    return (
      <div>
        <button
          onClick={() => setOpenPlan(null)}
          className="text-sm mb-4 focus:outline-none"
          style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}
        >
          ← All plans
        </button>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: C.ink }} className="mb-1">{plan.title}</h2>
        <p className="text-sm mb-4" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>{plan.blurb}</p>

        <div className="rounded-full h-2 mb-2" style={{ background: C.goldSoft }}>
          <div className="h-2 rounded-full transition-all" style={{ background: C.gold, width: `${pct}%` }} />
        </div>
        <p className="text-xs mb-6" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
          {done.size} of {plan.days.length} days · {pct}%
        </p>

        <div className="space-y-2">
          {plan.days.map(([label, book, chapter], i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: C.card, border: `1px solid ${C.border}`, opacity: done.has(i) ? 0.65 : 1 }}
            >
              <button
                onClick={() => toggleDay(plan.id, i)}
                aria-label={done.has(i) ? "Mark day incomplete" : "Mark day complete"}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs focus:outline-none flex-shrink-0"
                style={{
                  border: `2px solid ${done.has(i) ? C.gold : C.border}`,
                  background: done.has(i) ? C.gold : "transparent",
                  color: C.white,
                  fontFamily: "'Albert Sans', sans-serif",
                }}
              >
                {done.has(i) ? "✓" : ""}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-[15px]" style={{ fontFamily: "'Lora', serif", color: C.ink, textDecoration: done.has(i) ? "line-through" : "none" }}>
                  Day {i + 1} · {label}
                </p>
                <p className="text-xs" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
                  {book} {chapter}
                </p>
              </div>
              <button
                onClick={() => onOpenReading(book, chapter)}
                className="text-xs font-semibold focus:outline-none flex-shrink-0"
                style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}
              >
                Read →
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: C.ink }} className="mb-2">
        A little each day goes a long way.
      </h2>
      <p className="text-sm mb-6" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
        Pick a plan, read one short passage a day, and your progress is saved as you go.
      </p>
      <div className="space-y-3">
        {PLANS.map((plan) => {
          const done = (progress[plan.id] || []).length;
          const pct = Math.round((done / plan.days.length) * 100);
          return (
            <button
              key={plan.id}
              onClick={() => setOpenPlan(plan.id)}
              className="w-full text-left rounded-2xl px-5 py-4 focus:outline-none"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="flex items-baseline justify-between mb-1">
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 19, color: C.ink }}>{plan.title}</p>
                <p className="text-xs flex-shrink-0 ml-3" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}>
                  {plan.days.length} days{done > 0 ? ` · ${pct}%` : ""}
                </p>
              </div>
              <p className="text-sm" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>{plan.blurb}</p>
              {done > 0 && (
                <div className="rounded-full h-1.5 mt-3" style={{ background: C.goldSoft }}>
                  <div className="h-1.5 rounded-full" style={{ background: C.gold, width: `${pct}%` }} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ————— Companion (chat) tab —————
function CompanionTab({ seed, clearSeed }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (seed) {
      send(seed);
      clearSeed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setError(null);
    setInput("");
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setBusy(true);
    try {
      const { sources, sourceBlock } = await gatherSources(content, messages);
      const system = sourceBlock ? `${COMPANION_SYSTEM}\n\n${sourceBlock}` : COMPANION_SYSTEM;
      const apiMessages = next.map(({ role, content }) => ({ role, content }));
      const reply = await askClaude(system, apiMessages);
      setMessages([...next, { role: "assistant", content: reply, sources }]);
    } catch (e) {
      setError("The Companion couldn’t respond just now. Try again in a moment.");
      setMessages(messages);
    } finally {
      setBusy(false);
    }
  }

  const starters = [
    "What is the Bible, and how is it organized?",
    "What does “blessed are the poor in spirit” mean?",
    "How do different traditions read Genesis 1?",
    "I’m new to all of this. Where should I start?",
  ];

  return (
    <div className="flex flex-col" style={{ minHeight: 480 }}>
      {messages.length === 0 && (
        <div className="mb-6">
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: C.ink }} className="mb-2">
            Ask anything, from anywhere you’re starting.
          </h2>
          <p className="text-sm mb-4" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
            The Companion explains passages, history, and context — and where traditions differ, it shows you the range of views rather than picking one for you. When you ask about a passage, it reads the actual text plus study notes and cross-references, and shows you the sources it drew on.
          </p>
          <div className="flex flex-wrap gap-2">
            {starters.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="px-3 py-2 rounded-xl text-left text-sm focus:outline-none"
                style={{ fontFamily: "'Albert Sans', sans-serif", background: C.card, border: `1px solid ${C.border}`, color: C.ink }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 space-y-4 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-full sm:max-w-xl">
              <div
                className="rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap"
                style={{
                  fontFamily: m.role === "user" ? "'Albert Sans', sans-serif" : "'Lora', serif",
                  background: m.role === "user" ? C.deep : C.card,
                  color: m.role === "user" ? C.white : C.ink,
                  border: m.role === "user" ? "none" : `1px solid ${C.border}`,
                }}
              >
                {m.content}
              </div>
              {m.role === "assistant" && m.sources?.length > 0 && (
                <div className="mt-2 rounded-xl px-3 py-2" style={{ background: C.goldSoft, border: `1px solid ${C.border}` }}>
                  <p className="text-[10px] font-semibold mb-1" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Sources consulted
                  </p>
                  {m.sources.map((s) => (
                    <p key={s.id} className="text-[11px] leading-relaxed" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
                      <span style={{ color: C.gold, fontWeight: 600 }}>[{s.id}]</span> {s.label} · {s.kind}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <p className="text-sm italic" style={{ color: C.inkSoft, fontFamily: "'Lora', serif" }}>
            The Companion is reflecting…
          </p>
        )}
        {error && <p className="text-sm" style={{ color: "#8A3B2E", fontFamily: "'Albert Sans', sans-serif" }}>{error}</p>}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about a verse, a word, a story, a question…"
          className="flex-1 rounded-full px-4 py-2.5 text-sm focus:outline-none"
          style={{ fontFamily: "'Albert Sans', sans-serif", background: C.white, border: `1px solid ${C.border}`, color: C.ink }}
        />
        <GoldButton onClick={() => send()} disabled={busy || !input.trim()}>Ask</GoldButton>
      </div>
      <p className="mt-3 text-[11px]" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
        A study tool, not a spiritual authority — for personal decisions, talk with people you trust in your own community.
      </p>
    </div>
  );
}

// ————— Study Guide tab —————
function GuideTab() {
  const [passage, setPassage] = useState("");
  const [group, setGroup] = useState("A mixed group of adults, different backgrounds, some new to the Bible");
  const [guide, setGuide] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function generate() {
    if (!passage.trim() || busy) return;
    setBusy(true);
    setError(null);
    setGuide(null);
    try {
      const text = await askClaude(GUIDE_SYSTEM, [{ role: "user", content: `Passage or topic: ${passage}\nGroup: ${group}` }]);
      setGuide(text);
    } catch (e) {
      setError("Couldn’t generate the guide just now. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: C.ink }} className="mb-2">
        A discussion guide in under a minute.
      </h2>
      <p className="text-sm mb-6" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
        For small group leaders: name a passage or topic, describe your group, and get questions that move from the text to its world to your circle.
      </p>

      <label className="block text-xs font-semibold mb-1" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
        Passage or topic
      </label>
      <input
        value={passage}
        onChange={(e) => setPassage(e.target.value)}
        placeholder="e.g. Luke 15:11–32, or “forgiveness”"
        className="w-full rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none"
        style={{ fontFamily: "'Albert Sans', sans-serif", background: C.white, border: `1px solid ${C.border}`, color: C.ink }}
      />

      <label className="block text-xs font-semibold mb-1" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
        Who’s in the group?
      </label>
      <input
        value={group}
        onChange={(e) => setGroup(e.target.value)}
        className="w-full rounded-xl px-4 py-2.5 text-sm mb-5 focus:outline-none"
        style={{ fontFamily: "'Albert Sans', sans-serif", background: C.white, border: `1px solid ${C.border}`, color: C.ink }}
      />

      <GoldButton onClick={generate} disabled={busy || !passage.trim()}>
        {busy ? "Writing your guide…" : "Create study guide"}
      </GoldButton>

      {error && <p className="mt-4 text-sm" style={{ color: "#8A3B2E", fontFamily: "'Albert Sans', sans-serif" }}>{error}</p>}

      {guide && (
        <div
          className="mt-6 rounded-2xl px-5 py-5 whitespace-pre-wrap leading-relaxed text-[15px]"
          style={{ fontFamily: "'Lora', serif", background: C.card, border: `1px solid ${C.border}`, color: C.ink }}
        >
          {guide}
        </div>
      )}
    </div>
  );
}

// ————— Journal tab (verse notes + free entries) —————
function JournalTab({ onOpenReading }) {
  const [entries, setEntries] = useState([]);
  const [marks, setMarks] = useState({});
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("lampstand-journal");
        if (result?.value) setEntries(JSON.parse(result.value));
      } catch {
        // no entries yet
      }
      const m = await loadMarks();
      setMarks(m);
      setLoaded(true);
    })();
  }, []);

  async function save(next) {
    setEntries(next);
    try {
      await window.storage.set("lampstand-journal", JSON.stringify(next));
    } catch {
      // stays in memory this session
    }
  }

  async function removeMark(key) {
    const next = { ...marks };
    delete next[key];
    setMarks(next);
    await saveMarks(next);
  }

  function addEntry() {
    if (!draft.trim()) return;
    const next = [
      { id: Date.now(), date: new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }), text: draft.trim() },
      ...entries,
    ];
    save(next);
    setDraft("");
  }

  const markList = Object.entries(marks).map(([key, m]) => {
    const [book, chapter, verse] = key.split("|");
    return { key, book, chapter: Number(chapter), verse, ...m };
  });

  return (
    <div>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: C.ink }} className="mb-2">
        Keep what you’re learning.
      </h2>
      <p className="text-sm mb-6" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
        Your highlights, verse notes, and journal — all in one place, saved just for you.
      </p>

      {markList.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-semibold mb-3" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Highlights & verse notes
          </h3>
          <div className="space-y-2">
            {markList.map((m) => (
              <div key={m.key} className="rounded-2xl px-4 py-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-2 mb-1">
                  {m.color && <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: HIGHLIGHTS[m.color], border: `1px solid ${C.border}` }} />}
                  <p className="text-xs font-semibold flex-1" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
                    {m.book} {m.chapter}:{m.verse}
                  </p>
                  <button
                    onClick={() => onOpenReading(m.book, m.chapter)}
                    className="text-[11px] font-semibold focus:outline-none"
                    style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}
                  >
                    Open →
                  </button>
                  <button
                    onClick={() => removeMark(m.key)}
                    className="text-[11px] focus:outline-none"
                    style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}
                  >
                    Delete
                  </button>
                </div>
                {m.text && (
                  <p className="text-sm italic mb-1" style={{ fontFamily: "'Lora', serif", color: C.inkSoft }}>
                    “{m.text}{m.text.length >= 140 ? "…" : ""}”
                  </p>
                )}
                {m.note && (
                  <p className="text-[15px] leading-relaxed" style={{ fontFamily: "'Lora', serif", color: C.ink }}>
                    {m.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 className="text-xs font-semibold mb-3" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Journal
      </h3>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="What stood out to you today?"
        rows={4}
        className="w-full rounded-xl px-4 py-3 text-[15px] mb-3 focus:outline-none leading-relaxed"
        style={{ fontFamily: "'Lora', serif", background: C.white, border: `1px solid ${C.border}`, color: C.ink }}
      />
      <GoldButton onClick={addEntry} disabled={!draft.trim()}>Save entry</GoldButton>

      <div className="mt-8 space-y-4">
        {loaded && entries.length === 0 && (
          <p className="text-sm italic" style={{ color: C.inkSoft, fontFamily: "'Lora', serif" }}>
            Your first entry will appear here.
          </p>
        )}
        {entries.map((e) => (
          <div key={e.id} className="rounded-2xl px-5 py-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-semibold" style={{ color: C.gold, fontFamily: "'Albert Sans', sans-serif" }}>{e.date}</p>
              <button
                onClick={() => save(entries.filter((x) => x.id !== e.id))}
                className="text-[11px] focus:outline-none"
                style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}
              >
                Delete
              </button>
            </div>
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "'Lora', serif", color: C.ink }}>{e.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ————— App shell —————
export default function LampstandApp() {
  const [tab, setTab] = useState("today");
  const [seed, setSeed] = useState(null);
  const [readTarget, setReadTarget] = useState(null);

  function askAbout(prompt) {
    setSeed(prompt);
    setTab("companion");
  }

  function openReading(book, chapter) {
    setReadTarget({ book, chapter });
    setTab("read");
  }

  return (
    <div className="min-h-screen" style={{ background: C.paper }}>
      <style>{FONTS}</style>

      <header className="px-5 pt-8 pb-4 max-w-3xl mx-auto">
        <div className="flex items-baseline gap-3">
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 30, color: C.ink }}>Lampstand</h1>
          <span className="text-xs" style={{ color: C.gold, fontFamily: "'Albert Sans', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            working title
          </span>
        </div>
        <p className="text-sm mt-1" style={{ color: C.inkSoft, fontFamily: "'Lora', serif", fontStyle: "italic" }}>
          Scripture, open to everyone — whatever your tradition, wherever you’re starting.
        </p>
      </header>

      <nav className="px-5 max-w-3xl mx-auto flex gap-1 border-b overflow-x-auto" style={{ borderColor: C.border }}>
        <Tab label="Today" active={tab === "today"} onClick={() => setTab("today")} />
        <Tab label="Read" active={tab === "read"} onClick={() => setTab("read")} />
        <Tab label="Plans" active={tab === "plans"} onClick={() => setTab("plans")} />
        <Tab label="Companion" active={tab === "companion"} onClick={() => setTab("companion")} />
        <Tab label="Study Guide" active={tab === "guide"} onClick={() => setTab("guide")} />
        <Tab label="Journal" active={tab === "journal"} onClick={() => setTab("journal")} />
      </nav>

      <main className="px-5 py-8 max-w-3xl mx-auto">
        {tab === "today" && <TodayTab onOpenReading={openReading} onAskAbout={askAbout} goToPlans={() => setTab("plans")} />}
        {tab === "read" && <ReadTab target={readTarget} clearTarget={() => setReadTarget(null)} onAskAbout={askAbout} />}
        {tab === "plans" && <PlansTab onOpenReading={openReading} />}
        {tab === "companion" && <CompanionTab seed={seed} clearSeed={() => setSeed(null)} />}
        {tab === "guide" && <GuideTab />}
        {tab === "journal" && <JournalTab onOpenReading={openReading} />}
      </main>

      <footer className="px-5 pb-10 max-w-3xl mx-auto">
        <p className="text-[11px] leading-relaxed" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
          Lampstand is a non-profit project. Scripture: World English Bible, King James Version, and American Standard Version (public domain), served via bible-api.com. The Study Companion is an AI study tool — it describes texts, history, and the range of traditional interpretations; it does not decide questions of faith for you.
        </p>
      </footer>
    </div>
  );
}
