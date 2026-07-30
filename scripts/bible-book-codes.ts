// Maps source-dataset book identifiers to Lampstand's canonical book names
// (the same 66 names used in lib/constants.ts ALL_BOOKS).

// USFX 3-letter codes (seven1m/open-bibles eng-web.usfx.xml) → canonical name.
export const USFX_CODE_TO_BOOK: Record<string, string> = {
  GEN: "Genesis", EXO: "Exodus", LEV: "Leviticus", NUM: "Numbers", DEU: "Deuteronomy",
  JOS: "Joshua", JDG: "Judges", RUT: "Ruth", "1SA": "1 Samuel", "2SA": "2 Samuel",
  "1KI": "1 Kings", "2KI": "2 Kings", "1CH": "1 Chronicles", "2CH": "2 Chronicles",
  EZR: "Ezra", NEH: "Nehemiah", EST: "Esther", JOB: "Job", PSA: "Psalms", PRO: "Proverbs",
  ECC: "Ecclesiastes", SNG: "Song of Solomon", ISA: "Isaiah", JER: "Jeremiah",
  LAM: "Lamentations", EZK: "Ezekiel", DAN: "Daniel", HOS: "Hosea", JOL: "Joel",
  AMO: "Amos", OBA: "Obadiah", JON: "Jonah", MIC: "Micah", NAM: "Nahum", HAB: "Habakkuk",
  ZEP: "Zephaniah", HAG: "Haggai", ZEC: "Zechariah", MAL: "Malachi",
  MAT: "Matthew", MRK: "Mark", LUK: "Luke", JHN: "John", ACT: "Acts", ROM: "Romans",
  "1CO": "1 Corinthians", "2CO": "2 Corinthians", GAL: "Galatians", EPH: "Ephesians",
  PHP: "Philippians", COL: "Colossians", "1TH": "1 Thessalonians", "2TH": "2 Thessalonians",
  "1TI": "1 Timothy", "2TI": "2 Timothy", TIT: "Titus", PHM: "Philemon", HEB: "Hebrews",
  JAS: "James", "1PE": "1 Peter", "2PE": "2 Peter", "1JN": "1 John", "2JN": "2 John",
  "3JN": "3 John", JUD: "Jude", REV: "Revelation",
};

// scrollmapper/bible_databases CSV book names → canonical name (only entries that differ).
export const CSV_BOOK_TO_BOOK: Record<string, string> = {
  "I Samuel": "1 Samuel", "II Samuel": "2 Samuel",
  "I Kings": "1 Kings", "II Kings": "2 Kings",
  "I Chronicles": "1 Chronicles", "II Chronicles": "2 Chronicles",
  "I Corinthians": "1 Corinthians", "II Corinthians": "2 Corinthians",
  "I Thessalonians": "1 Thessalonians", "II Thessalonians": "2 Thessalonians",
  "I Timothy": "1 Timothy", "II Timothy": "2 Timothy",
  "I Peter": "1 Peter", "II Peter": "2 Peter",
  "I John": "1 John", "II John": "2 John", "III John": "3 John",
  "Revelation of John": "Revelation",
};
