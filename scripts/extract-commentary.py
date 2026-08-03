# Extracts verse-by-verse text from public-domain SWORD Bible modules (Matthew
# Henry's Complete Commentary, Jamieson-Fausset-Brown, Barnes' Notes on the NT).
#
# These are distributed by CrossWire (the SWORD Project) in a compressed binary
# format. `pysword` (pip install pysword) can read it, but its public API only
# whitelists Bible *text* module drivers (ztext/ztext4) — not the structurally
# identical commentary drivers (zCom/zCom4) these modules actually declare. The
# underlying block format is the same either way, so this bypasses that whitelist
# by instantiating pysword's internal parser classes directly rather than going
# through SwordBible's type-checked constructor.
#
# Setup:
#   1. pip install pysword
#   2. Download and unzip each module into scripts/.data/sword-modules/<Name>/:
#      curl -O https://www.crosswire.org/ftpmirror/pub/sword/packages/rawzip/MHC.zip
#      curl -O https://www.crosswire.org/ftpmirror/pub/sword/packages/rawzip/JFB.zip
#      curl -O https://www.crosswire.org/ftpmirror/pub/sword/packages/rawzip/Barnes.zip
#      (unzip each into scripts/.data/sword-modules/MHC, .../JFB, .../Barnes)
#   3. python scripts/extract-commentary.py
#      → writes scripts/.data/commentary.json
#   4. npm run import:commentary-prose

import json
import os
import re
from pysword.bible import ZTextModule, ZTextModule4

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODULES_DIR = os.path.join(SCRIPT_DIR, ".data", "sword-modules")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, ".data", "commentary.json")

# (canonical name, chapter count) — must match lib/constants.ts ALL_BOOKS exactly.
ALL_BOOKS = [
    ("Genesis", 50), ("Exodus", 40), ("Leviticus", 27), ("Numbers", 36), ("Deuteronomy", 34),
    ("Joshua", 24), ("Judges", 21), ("Ruth", 4), ("1 Samuel", 31), ("2 Samuel", 24),
    ("1 Kings", 22), ("2 Kings", 25), ("1 Chronicles", 29), ("2 Chronicles", 36), ("Ezra", 10),
    ("Nehemiah", 13), ("Esther", 10), ("Job", 42), ("Psalms", 150), ("Proverbs", 31),
    ("Ecclesiastes", 12), ("Song of Solomon", 8), ("Isaiah", 66), ("Jeremiah", 52),
    ("Lamentations", 5), ("Ezekiel", 48), ("Daniel", 12), ("Hosea", 14), ("Joel", 3),
    ("Amos", 9), ("Obadiah", 1), ("Jonah", 4), ("Micah", 7), ("Nahum", 3), ("Habakkuk", 3),
    ("Zephaniah", 3), ("Haggai", 2), ("Zechariah", 14), ("Malachi", 4),
    ("Matthew", 28), ("Mark", 16), ("Luke", 24), ("John", 21), ("Acts", 28), ("Romans", 16),
    ("1 Corinthians", 16), ("2 Corinthians", 13), ("Galatians", 6), ("Ephesians", 6),
    ("Philippians", 4), ("Colossians", 4), ("1 Thessalonians", 5), ("2 Thessalonians", 3),
    ("1 Timothy", 6), ("2 Timothy", 4), ("Titus", 3), ("Philemon", 1), ("Hebrews", 13),
    ("James", 5), ("1 Peter", 5), ("2 Peter", 3), ("1 John", 5), ("2 John", 1),
    ("3 John", 1), ("Jude", 1), ("Revelation", 22),
]
NT_START_INDEX = 39  # Matthew is the 40th book (index 39) — first 39 are OT

MODULES = [
    {
        "source": "Matthew Henry's Complete Commentary (1710)",
        "path": os.path.join(MODULES_DIR, "MHC", "modules", "comments", "zcom4", "mhc") + os.sep,
        "cls": ZTextModule4, "module_type": "ztext4", "block_type": "BOOK", "source_type": "OSIS",
    },
    {
        "source": "Jamieson-Fausset-Brown Commentary (1871)",
        "path": os.path.join(MODULES_DIR, "JFB", "modules", "comments", "zcom", "jfb") + os.sep,
        "cls": ZTextModule4, "module_type": "ztext4", "block_type": "BOOK", "source_type": "OSIS",
    },
    {
        "source": "Barnes' Notes on the New Testament (1834)",
        "path": os.path.join(MODULES_DIR, "Barnes", "modules", "comments", "zcom", "barnes") + os.sep,
        "cls": ZTextModule, "module_type": "ztext", "block_type": "CHAPTER", "source_type": "ThML",
        "nt_only": True,
    },
]

WS_RE = re.compile(r"\s+")


def clean(text):
    if not text:
        return ""
    text = text.replace("�", "")  # stray replacement-character artifacts
    return WS_RE.sub(" ", text).strip()


def load_module(m):
    mod = m["cls"].__new__(m["cls"])
    mod.__init__(
        module_path=m["path"], module_type=m["module_type"], versification="kjv",
        encoding="utf-8", source_type=m["source_type"], block_type=m["block_type"],
        compress_type="ZIP",
    )
    return mod


def main():
    rows = []
    for m in MODULES:
        print(f"Extracting {m['source']} …")
        mod = load_module(m)
        count = 0
        books = ALL_BOOKS[NT_START_INDEX:] if m.get("nt_only") else ALL_BOOKS
        for book, chapter_count in books:
            for chapter in range(1, chapter_count + 1):
                verse = 1
                while True:
                    try:
                        text = mod.get(books=[book], chapters=[chapter], verses=[verse])
                    except ValueError:
                        break  # past the last verse in this chapter
                    except Exception as e:
                        print(f"  ! {book} {chapter}:{verse} — {type(e).__name__}: {e}")
                        break
                    cleaned = clean(text)
                    if cleaned:
                        rows.append({
                            "book": book, "chapter": chapter, "verse": verse,
                            "source": m["source"], "text": cleaned[:4000],
                        })
                        count += 1
                    verse += 1
                    if verse > 180:  # safety valve — no chapter has more verses than this
                        break
        print(f"  {count} verse entries extracted")

    print(f"\nTotal rows: {len(rows)}")
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False)
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
