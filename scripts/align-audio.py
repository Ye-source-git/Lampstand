"""
Forced-alignment pipeline: for a given LibriVox audio_tracks row, aligns the
known verse text (already in Supabase) against the audio to produce per-verse
start/end timestamps, written to audio_verse_timestamps.

This is offline pipeline tooling, not part of the app runtime. Requires a
venv with torch + torchaudio installed, plus ffmpeg on PATH (see README note
in scripts/audio-verse-timestamps-schema.sql for context).

Long audio files are processed in ~30s chunks cut at natural silences, because
whole-file alignment scales quadratically with length and is impractical for
the longer multi-chapter LibriVox recordings.

Usage:
  python scripts/align-audio.py --translation web --book Philippians
  python scripts/align-audio.py --translation web --book "1 Peter"
"""
import argparse, json, os, re, subprocess, sys, time, wave
import numpy as np
import torch
import torchaudio

SR = torchaudio.pipelines.MMS_FA.sample_rate


def normalize_word(w):
    w = w.lower()
    w = re.sub(r"[’']", "'", w)
    w = re.sub(r"[^a-z']", "", w)
    return w


def load_wav_mono16k(mp3_path, tmp_dir, sr=SR):
    wav_path = os.path.join(tmp_dir, "chunk_src.wav")
    subprocess.run(["ffmpeg", "-y", "-i", mp3_path, "-ac", "1", "-ar", str(sr), wav_path], check=True, capture_output=True)
    with wave.open(wav_path, "rb") as w:
        raw = w.readframes(w.getnframes())
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0


def silence_cutpoints(mp3_path, noise="-30dB", min_dur=0.3):
    out = subprocess.run(
        ["ffmpeg", "-i", mp3_path, "-af", f"silencedetect=noise={noise}:d={min_dur}", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    return list(zip(starts, ends))


def build_chunks(total_duration, silences, target_len=28.0, max_len=45.0):
    midpoints = sorted((s + e) / 2 for s, e in silences if 0 < (s + e) / 2 < total_duration)
    chunks, chunk_start = [], 0.0
    while chunk_start < total_duration - 1.0:
        desired = chunk_start + target_len
        candidates = [m for m in midpoints if chunk_start + 8.0 <= m <= chunk_start + max_len]
        cut = min(candidates, key=lambda m: abs(m - desired)) if candidates else min(chunk_start + max_len, total_duration)
        cut = min(cut, total_duration)
        chunks.append((chunk_start, cut))
        chunk_start = cut
    return chunks


class Aligner:
    def __init__(self):
        bundle = torchaudio.pipelines.MMS_FA
        self.model = bundle.get_model()
        labels = bundle.get_labels(star=None)
        self.dictionary = {c: i for i, c in enumerate(labels)}

    def align_chunk(self, waveform_slice, words_slice):
        wav = torch.from_numpy(waveform_slice).unsqueeze(0)
        with torch.inference_mode():
            emission, _ = self.model(wav)
        tokenized = [[self.dictionary[c] for c in w] for w in words_slice]
        flat = [t for w in tokenized for t in w]
        if not flat:
            return []
        targets = torch.tensor(flat, dtype=torch.int32).unsqueeze(0)
        aligned_tokens, scores = torchaudio.functional.forced_align(emission, targets, blank=0)
        aligned_tokens, scores = aligned_tokens[0], scores[0]
        token_spans = torchaudio.functional.merge_tokens(aligned_tokens, scores, blank=0)
        ratio = wav.shape[1] / emission.shape[1] / SR
        spans, ptr = [], 0
        for w in words_slice:
            n = len(w)
            sp = token_spans[ptr:ptr + n]
            ptr += n
            spans.append((sp[0].start * ratio, sp[-1].end * ratio) if sp else None)
        return spans


def align_file(aligner, mp3_path, verses, tmp_dir):
    """verses: list of {chapter, verse, text} covering exactly what's spoken
    in this audio file, in order. Returns list of {chapter, verse, start, end}."""
    words, word_owner = [], []
    for v in verses:
        for raw in v["text"].split():
            w = normalize_word(raw)
            if w:
                words.append(w)
                word_owner.append((v["chapter"], v["verse"]))
    total_words = len(words)

    samples = load_wav_mono16k(mp3_path, tmp_dir)
    total_duration = len(samples) / SR
    silences = silence_cutpoints(mp3_path)
    chunks = build_chunks(total_duration, silences)
    print(f"    {total_words} words, {total_duration:.0f}s audio, {len(chunks)} chunks", flush=True)

    rate = total_words / total_duration
    all_spans = [None] * total_words
    word_ptr = 0
    t0 = time.time()
    for i, (cs, ce) in enumerate(chunks):
        est_count = max(1, round((ce - cs) * rate * 1.35))
        end_ptr = min(total_words, word_ptr + est_count)
        chunk_words = words[word_ptr:end_ptr]
        s0, s1 = int(cs * SR), int(ce * SR)
        spans = aligner.align_chunk(samples[s0:s1], chunk_words)
        committed = 0
        for j, sp in enumerate(spans):
            if sp is None:
                continue
            if sp[1] <= (ce - cs) + 0.6 or j == len(spans) - 1:
                all_spans[word_ptr + j] = (cs + sp[0], cs + sp[1])
                committed = j + 1
            else:
                break
        word_ptr += committed
        if (i + 1) % 10 == 0 or i == len(chunks) - 1:
            print(f"    chunk {i+1}/{len(chunks)}  words {word_ptr}/{total_words}  ({time.time()-t0:.0f}s)", flush=True)

    verse_times = {}
    for (chapter, verse), span in zip(word_owner, all_spans):
        if span is None:
            continue
        key = (chapter, verse)
        if key not in verse_times:
            verse_times[key] = [span[0], span[1]]
        else:
            verse_times[key][0] = min(verse_times[key][0], span[0])
            verse_times[key][1] = max(verse_times[key][1], span[1])

    return [{"chapter": c, "verse": v, "start": round(s, 2), "end": round(e, 2)} for (c, v), (s, e) in sorted(verse_times.items())]


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--translation", required=True)
    p.add_argument("--book", required=True)
    p.add_argument("--supabase-url", default=os.environ.get("NEXT_PUBLIC_SUPABASE_URL"))
    p.add_argument("--supabase-key", default=os.environ.get("SUPABASE_SERVICE_ROLE_KEY"))
    p.add_argument("--out", default="alignment_output.json", help="Where to write results for the Node import script")
    args = p.parse_args()

    if not args.supabase_url or not args.supabase_key:
        print("Missing --supabase-url/--supabase-key (or env vars). This script only reads verse", file=sys.stderr)
        print("text and audio_tracks metadata via REST -- it does not need the service key to be", file=sys.stderr)
        print("kept secret beyond your own machine, but it does need read access.", file=sys.stderr)
        sys.exit(1)

    import urllib.request

    def rest_get(path):
        req = urllib.request.Request(
            f"{args.supabase_url}/rest/v1/{path}",
            headers={"apikey": args.supabase_key, "Authorization": f"Bearer {args.supabase_key}"},
        )
        with urllib.request.urlopen(req) as resp:
            return json.load(resp)

    tracks = rest_get(
        f"audio_tracks?translation=eq.{args.translation}&book={urllib.parse.quote(args.book)}&select=*"
        if False else f"audio_tracks?translation=eq.{args.translation}&book=eq.{urllib.parse.quote(args.book)}&select=*"
    )
    if not tracks:
        print(f"No audio_tracks rows for {args.translation}/{args.book}", file=sys.stderr)
        sys.exit(1)

    aligner = Aligner()
    tmp_dir = "align_tmp"
    os.makedirs(tmp_dir, exist_ok=True)
    results = []

    for track in tracks:
        print(f"Track {track['id']}: {track['book']} {track['chapter_start']}-{track['chapter_end']} ({track['url']})", flush=True)
        mp3_path = os.path.join(tmp_dir, f"track_{track['id']}.mp3")
        if not os.path.exists(mp3_path):
            subprocess.run(["curl", "-sL", "-o", mp3_path, track["url"]], check=True)

        verses = rest_get(
            f"verses?translation=eq.{args.translation}&book=eq.{urllib.parse.quote(track['book'])}"
            f"&chapter=gte.{track['chapter_start']}&chapter=lte.{track['chapter_end']}"
            f"&select=chapter,verse,text&order=chapter,verse"
        )
        rows = align_file(aligner, mp3_path, verses, tmp_dir)
        for r in rows:
            results.append({
                "audio_track_id": track["id"],
                "translation": args.translation,
                "book": track["book"],
                "chapter": r["chapter"],
                "verse": r["verse"],
                "start_seconds": r["start"],
                "end_seconds": r["end"],
            })

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"\nWrote {len(results)} verse timestamps to {args.out}")


if __name__ == "__main__":
    import urllib.parse
    main()
